local json = require("json")

Name = Name or "ao-task-board-lab"
Configured = Configured or false
Owner = Owner or ""
NextTaskId = NextTaskId or 1
Tasks = Tasks or {}
TasksById = TasksById or {}
UpdatedAt = UpdatedAt or ""

local function respond(msg, payload)
  if msg.reply then
    msg.reply(payload)
  else
    payload.Target = msg.From
    Send(payload)
  end
end

local function trim(value)
  return (tostring(value or "")):gsub("^%s+", ""):gsub("%s+$", "")
end

local function findTagValue(tags, name)
  if not tags then
    return nil
  end

  local needle = string.lower(name)

  if tags[1] then
    for _, tag in ipairs(tags) do
      local tagName = tag.name or tag.Name
      local tagValue = tag.value or tag.Value
      if tagName and string.lower(tagName) == needle then
        return tagValue
      end
    end
  end

  if tags[name] ~= nil then
    return tags[name]
  end

  for key, value in pairs(tags) do
    if type(key) == "string" and string.lower(key) == needle then
      return value
    end
  end

  return nil
end

local function tagOrField(msg, key)
  return findTagValue(msg.Tags, key) or findTagValue(msg.TagArray, key) or msg[key]
end

local function nowFrom(msg)
  return tostring(msg.Timestamp or "")
end

local function errorReply(msg, action, message)
  respond(msg, {
    Action = action .. "-Error",
    Error = message
  })
end

local function ensureConfigured(msg, action)
  if Configured then
    return true
  end

  errorReply(msg, action, "process not configured")
  return false
end

local function ensureOwner(msg, action)
  if not ensureConfigured(msg, action) then
    return false
  end

  if msg.From == Owner then
    return true
  end

  errorReply(msg, action, "unauthorized: owner required")
  return false
end

local function parseName(raw)
  local value = trim(raw)
  if value == "" then
    return nil
  end
  if #value > 64 then
    return nil, "Name too long"
  end
  return value
end

local function parseTitle(raw)
  local value = trim(raw)
  if value == "" then
    return nil, "Title required"
  end
  if #value > 120 then
    return nil, "Title too long"
  end
  return value
end

local function parseDescription(raw)
  local value = trim(raw)
  if value == "" then
    return ""
  end
  if #value > 500 then
    return nil, "Description too long"
  end
  return value
end

local function normalizePriority(raw)
  local value = trim(raw)
  if value == "" then
    return "medium"
  end

  value = string.lower(value)
  if value == "low" or value == "medium" or value == "high" or value == "urgent" then
    return value
  end

  return nil
end

local function normalizeStatus(raw)
  local value = trim(raw)
  if value == "" then
    return nil
  end

  value = string.lower(value)
  if value == "open" or value == "in_progress" or value == "done" then
    return value
  end

  return nil
end

local function parseAssignee(raw)
  local value = trim(raw)
  if value == "" then
    return nil, "Assignee required"
  end
  if #value > 128 then
    return nil, "Assignee too long"
  end
  return value
end

local function parseTaskId(raw)
  local value = trim(raw)
  if value == "" then
    return nil, "Task-Id required"
  end

  local numeric = tonumber(value)
  if numeric == nil or numeric < 1 or numeric ~= math.floor(numeric) then
    return nil, "Task-Id must be a positive integer"
  end

  return tostring(numeric)
end

local function getTaskById(taskId)
  return TasksById[taskId]
end

local function taskPayload(task)
  return {
    Id = task.Id,
    Title = task.Title,
    Description = task.Description,
    Priority = task.Priority,
    Assignee = task.Assignee,
    Status = task.Status,
    CreatedAt = task.CreatedAt,
    UpdatedAt = task.UpdatedAt,
    CompletedAt = task.CompletedAt,
    CreatedBy = task.CreatedBy
  }
end

local function boardStats()
  local stats = {
    Total = 0,
    Open = 0,
    InProgress = 0,
    Done = 0
  }

  for _, task in ipairs(Tasks) do
    stats.Total = stats.Total + 1

    if task.Status == "open" then
      stats.Open = stats.Open + 1
    elseif task.Status == "in_progress" then
      stats.InProgress = stats.InProgress + 1
    elseif task.Status == "done" then
      stats.Done = stats.Done + 1
    end
  end

  return stats
end

local function statePayload()
  local tasks = {}
  for _, task in ipairs(Tasks) do
    table.insert(tasks, taskPayload(task))
  end

  return {
    Name = Name,
    Owner = Owner,
    Configured = Configured,
    NextTaskId = NextTaskId,
    UpdatedAt = UpdatedAt,
    Stats = boardStats(),
    Tasks = tasks
  }
end

Handlers.add(
  "info",
  Handlers.utils.hasMatchingTag("Action", "Info"),
  function(msg)
    local stats = boardStats()
    respond(msg, {
      Action = "Info-Result",
      Name = Name,
      Owner = Owner,
      Configured = tostring(Configured),
      ["Task-Count"] = tostring(stats.Total),
      ["Next-Task-Id"] = tostring(NextTaskId),
      UpdatedAt = UpdatedAt,
      Data = json.encode({
        Name = Name,
        Owner = Owner,
        Configured = Configured,
        NextTaskId = NextTaskId,
        UpdatedAt = UpdatedAt,
        Stats = stats
      })
    })
  end
)

Handlers.add(
  "get-state",
  Handlers.utils.hasMatchingTag("Action", "Get-State"),
  function(msg)
    local state = statePayload()
    respond(msg, {
      Action = "Get-State-Result",
      Name = state.Name,
      Owner = state.Owner,
      Configured = tostring(state.Configured),
      ["Task-Count"] = tostring(#state.Tasks),
      ["Next-Task-Id"] = tostring(state.NextTaskId),
      UpdatedAt = state.UpdatedAt,
      Data = json.encode(state)
    })
  end
)

Handlers.add(
  "init",
  Handlers.utils.hasMatchingTag("Action", "Init"),
  function(msg)
    if Configured then
      errorReply(msg, "Init", "process already configured")
      return
    end

    local requestedName, nameError = parseName(tagOrField(msg, "Name"))
    if nameError then
      errorReply(msg, "Init", nameError)
      return
    end

    if requestedName then
      Name = requestedName
    end

    Owner = msg.From
    Configured = true
    UpdatedAt = nowFrom(msg)

    respond(msg, {
      Action = "Init-OK",
      Name = Name,
      Owner = Owner
    })
  end
)

Handlers.add(
  "create-task",
  Handlers.utils.hasMatchingTag("Action", "Create-Task"),
  function(msg)
    if not ensureOwner(msg, "Create-Task") then
      return
    end

    local title, titleError = parseTitle(tagOrField(msg, "Title"))
    if titleError then
      errorReply(msg, "Create-Task", titleError)
      return
    end

    local description, descriptionError = parseDescription(tagOrField(msg, "Description"))
    if descriptionError then
      errorReply(msg, "Create-Task", descriptionError)
      return
    end

    local priority = normalizePriority(tagOrField(msg, "Priority"))
    if priority == nil then
      errorReply(msg, "Create-Task", "Priority must be low, medium, high, or urgent")
      return
    end

    local taskId = tostring(NextTaskId)
    local timestamp = nowFrom(msg)
    local task = {
      Id = taskId,
      Title = title,
      Description = description,
      Priority = priority,
      Assignee = "",
      Status = "open",
      CreatedAt = timestamp,
      UpdatedAt = timestamp,
      CompletedAt = "",
      CreatedBy = msg.From
    }

    table.insert(Tasks, task)
    TasksById[taskId] = task
    NextTaskId = NextTaskId + 1
    UpdatedAt = timestamp

    respond(msg, {
      Action = "Create-Task-OK",
      ["Task-Id"] = taskId,
      Status = task.Status,
      Priority = task.Priority,
      Title = task.Title
    })
  end
)

Handlers.add(
  "assign-task",
  Handlers.utils.hasMatchingTag("Action", "Assign-Task"),
  function(msg)
    if not ensureOwner(msg, "Assign-Task") then
      return
    end

    local taskId, taskIdError = parseTaskId(tagOrField(msg, "Task-Id") or tagOrField(msg, "TaskId"))
    if taskIdError then
      errorReply(msg, "Assign-Task", taskIdError)
      return
    end

    local assignee, assigneeError = parseAssignee(tagOrField(msg, "Assignee"))
    if assigneeError then
      errorReply(msg, "Assign-Task", assigneeError)
      return
    end

    local task = getTaskById(taskId)
    if not task then
      errorReply(msg, "Assign-Task", "Task not found")
      return
    end

    task.Assignee = assignee
    task.UpdatedAt = nowFrom(msg)
    UpdatedAt = task.UpdatedAt

    respond(msg, {
      Action = "Assign-Task-OK",
      ["Task-Id"] = taskId,
      Assignee = task.Assignee,
      Status = task.Status
    })
  end
)

Handlers.add(
  "start-task",
  Handlers.utils.hasMatchingTag("Action", "Start-Task"),
  function(msg)
    if not ensureOwner(msg, "Start-Task") then
      return
    end

    local taskId, taskIdError = parseTaskId(tagOrField(msg, "Task-Id") or tagOrField(msg, "TaskId"))
    if taskIdError then
      errorReply(msg, "Start-Task", taskIdError)
      return
    end

    local task = getTaskById(taskId)
    if not task then
      errorReply(msg, "Start-Task", "Task not found")
      return
    end

    if task.Status ~= "open" then
      errorReply(msg, "Start-Task", "Task must be open")
      return
    end

    task.Status = "in_progress"
    task.UpdatedAt = nowFrom(msg)
    UpdatedAt = task.UpdatedAt

    respond(msg, {
      Action = "Start-Task-OK",
      ["Task-Id"] = taskId,
      Status = task.Status
    })
  end
)

Handlers.add(
  "complete-task",
  Handlers.utils.hasMatchingTag("Action", "Complete-Task"),
  function(msg)
    if not ensureOwner(msg, "Complete-Task") then
      return
    end

    local taskId, taskIdError = parseTaskId(tagOrField(msg, "Task-Id") or tagOrField(msg, "TaskId"))
    if taskIdError then
      errorReply(msg, "Complete-Task", taskIdError)
      return
    end

    local task = getTaskById(taskId)
    if not task then
      errorReply(msg, "Complete-Task", "Task not found")
      return
    end

    if task.Status ~= "in_progress" then
      errorReply(msg, "Complete-Task", "Task must be in_progress")
      return
    end

    task.Status = "done"
    task.CompletedAt = nowFrom(msg)
    task.UpdatedAt = task.CompletedAt
    UpdatedAt = task.UpdatedAt

    respond(msg, {
      Action = "Complete-Task-OK",
      ["Task-Id"] = taskId,
      Status = task.Status,
      CompletedAt = task.CompletedAt
    })
  end
)

Handlers.add(
  "reopen-task",
  Handlers.utils.hasMatchingTag("Action", "Reopen-Task"),
  function(msg)
    if not ensureOwner(msg, "Reopen-Task") then
      return
    end

    local taskId, taskIdError = parseTaskId(tagOrField(msg, "Task-Id") or tagOrField(msg, "TaskId"))
    if taskIdError then
      errorReply(msg, "Reopen-Task", taskIdError)
      return
    end

    local task = getTaskById(taskId)
    if not task then
      errorReply(msg, "Reopen-Task", "Task not found")
      return
    end

    if task.Status ~= "done" then
      errorReply(msg, "Reopen-Task", "Task must be done")
      return
    end

    task.Status = "open"
    task.CompletedAt = ""
    task.UpdatedAt = nowFrom(msg)
    UpdatedAt = task.UpdatedAt

    respond(msg, {
      Action = "Reopen-Task-OK",
      ["Task-Id"] = taskId,
      Status = task.Status
    })
  end
)

Handlers.add(
  "get-task",
  Handlers.utils.hasMatchingTag("Action", "Get-Task"),
  function(msg)
    if not ensureConfigured(msg, "Get-Task") then
      return
    end

    local taskId, taskIdError = parseTaskId(tagOrField(msg, "Task-Id") or tagOrField(msg, "TaskId"))
    if taskIdError then
      errorReply(msg, "Get-Task", taskIdError)
      return
    end

    local task = getTaskById(taskId)
    if not task then
      errorReply(msg, "Get-Task", "Task not found")
      return
    end

    respond(msg, {
      Action = "Get-Task-Result",
      ["Task-Id"] = task.Id,
      Title = task.Title,
      Priority = task.Priority,
      Assignee = task.Assignee,
      Status = task.Status,
      UpdatedAt = task.UpdatedAt,
      Data = json.encode(taskPayload(task))
    })
  end
)

Handlers.add(
  "list-tasks",
  Handlers.utils.hasMatchingTag("Action", "List-Tasks"),
  function(msg)
    if not ensureConfigured(msg, "List-Tasks") then
      return
    end

    local statusRaw = tagOrField(msg, "Status")
    local priorityRaw = tagOrField(msg, "Priority")
    local assigneeFilter = trim(tagOrField(msg, "Assignee"))

    local statusFilter = nil
    if trim(statusRaw) ~= "" then
      statusFilter = normalizeStatus(statusRaw)
      if statusFilter == nil then
        errorReply(msg, "List-Tasks", "Status must be open, in_progress, or done")
        return
      end
    end

    local priorityFilter = nil
    if trim(priorityRaw) ~= "" then
      priorityFilter = normalizePriority(priorityRaw)
      if priorityFilter == nil then
        errorReply(msg, "List-Tasks", "Priority must be low, medium, high, or urgent")
        return
      end
    end

    local filtered = {}
    for _, task in ipairs(Tasks) do
      local include = true

      if statusFilter and task.Status ~= statusFilter then
        include = false
      end

      if priorityFilter and task.Priority ~= priorityFilter then
        include = false
      end

      if assigneeFilter ~= "" and task.Assignee ~= assigneeFilter then
        include = false
      end

      if include then
        table.insert(filtered, taskPayload(task))
      end
    end

    respond(msg, {
      Action = "List-Tasks-Result",
      Count = tostring(#filtered),
      Data = json.encode(filtered)
    })
  end
)

Handlers.add(
  "board-stats",
  Handlers.utils.hasMatchingTag("Action", "Board-Stats"),
  function(msg)
    if not ensureConfigured(msg, "Board-Stats") then
      return
    end

    local stats = boardStats()
    respond(msg, {
      Action = "Board-Stats-Result",
      Total = tostring(stats.Total),
      Open = tostring(stats.Open),
      ["In-Progress"] = tostring(stats.InProgress),
      Done = tostring(stats.Done),
      Data = json.encode(stats)
    })
  end
)
