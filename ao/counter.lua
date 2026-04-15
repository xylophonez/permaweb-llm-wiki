Name = Name or "ao-counter-lab"
Configured = Configured or false
Owner = Owner or ""
Count = Count or 0
UpdatedAt = UpdatedAt or ""

local function respond(msg, payload)
  if msg.reply then
    msg.reply(payload)
  else
    payload.Target = msg.From
    Send(payload)
  end
end

local function findTagValue(tags, name)
  if not tags then return nil end
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
  if tags[name] ~= nil then return tags[name] end
  for key, value in pairs(tags) do
    if type(key) == "string" and string.lower(key) == needle then return value end
  end
  return nil
end

local function tagOrField(msg, key)
  return findTagValue(msg.Tags, key) or findTagValue(msg.TagArray, key) or msg[key]
end

local function assertOwner(msg)
  assert(Configured, "process not configured")
  assert(msg.From == Owner, "unauthorized: owner required")
end

Handlers.add(
  "info",
  Handlers.utils.hasMatchingTag("Action", "Info"),
  function(msg)
    respond(msg, {
      Action = "Info-Result",
      Name = Name,
      Owner = Owner,
      Configured = tostring(Configured),
      Count = tostring(Count),
      UpdatedAt = UpdatedAt
    })
  end
)

Handlers.add(
  "init",
  Handlers.utils.hasMatchingTag("Action", "Init"),
  function(msg)
    assert(not Configured, "process already configured")
    local processName = tagOrField(msg, "Name")
    if processName and processName ~= "" then
      assert(#processName <= 64, "Name too long")
      Name = processName
    end
    Owner = msg.From
    Configured = true
    UpdatedAt = tostring(msg.Timestamp or "")

    respond(msg, {
      Action = "Init-OK",
      Name = Name,
      Owner = Owner
    })
  end
)

Handlers.add(
  "increment",
  Handlers.utils.hasMatchingTag("Action", "Increment"),
  function(msg)
    assertOwner(msg)
    local amountRaw = tagOrField(msg, "Amount") or "1"
    local amount = tonumber(amountRaw)
    assert(amount ~= nil, "Amount must be numeric")
    assert(amount >= 1 and amount <= 1000000, "Amount out of range")
    Count = Count + amount
    UpdatedAt = tostring(msg.Timestamp or "")
    respond(msg, {
      Action = "Increment-OK",
      Count = tostring(Count),
      Added = tostring(amount)
    })
  end
)

Handlers.add(
  "get",
  Handlers.utils.hasMatchingTag("Action", "Get"),
  function(msg)
    respond(msg, {
      Action = "Get-Result",
      Count = tostring(Count),
      UpdatedAt = UpdatedAt
    })
  end
)
