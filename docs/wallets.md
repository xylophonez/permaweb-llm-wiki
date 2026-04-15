A flattened version of the Wander docs repository. Wander is the main browser extension wallet for Arweave.

===== FILE: README.md =====
---
description: >-
  A non-custodial Arweave and AO native wallet with extensive features.  Wander
  is available as a browser extension, mobile application, and embedded wallet
  SDK.
---

# 👋 Welcome to Wander

<figure><img src=".gitbook/assets/Docs-Home.png" alt="Wander cover image"><figcaption></figcaption></figure>

Wander is an Arweave and AO native wallet that provides non-custodial wallet and asset management. Wander allows wallet holders to interact with any Arweave or AO dApps securely, without sharing their private keys with the dApp.&#x20;

{% hint style="info" %}
_Wander was formerly known as ArConnect_
{% endhint %}

<figure><img src=".gitbook/assets/Docs-Flow (2).png" alt="Wander user flow"><figcaption></figcaption></figure>

The isolated environment that Wander creates is not only a security improvement for users, but it also provides a more seamless login flow for applications. Developers no longer have to build sign in functionality, they can let Wander do the hard work for them.

There are three products which work together but have different use cases depending on the experience developers want to provide to their users:

* _Wander Connect_ - An embedded wallet that will take the friction out of onboarding by offering multiple authentication options (SSO, Passkey, etc) via a very simple SDK.  Zero downloads or zero installs needed for end users.  Wander Connect will also be able to be customized and white-labeled to give your dApps a smoother UX experience.  [Get started with Wander Connect.](https://docs.wander.app/wander-connect/intro)
* _Wander Browser Extension_ - A traditional web3 wallet experience and the OG Wander product.  For the more experienced Web3 user, the browser extension gives users and developers the classic web3 experience for their dApps.  Users can generate a wallet without needing to provide an email.  [Get started with the Wander Browser Extension](https://docs.wander.app/api/intro). &#x20;
* _Wander Mobile App_ - Similar to the Wander Browser Extension, the Wander Mobile App (and Wander Connect) is for developers that have a mobile first focus for their dApp.  Like the browser extension, users can generate a wallet without needing to provide an email and easily access any AO dApp directly from the mobile app.  [Get started with the Wander Mobile App](https://docs.wander.app/api/intro).

_Note: By integrating the Wander Injected API, your dApp will have support for the Wander Browser Extension and Wander Mobile App_

===== END FILE: README.md =====

===== FILE: SUMMARY.md =====
# Table of contents

* [👋 Welcome to Wander](README.md)

## ⚡ Wander Connect

* [Intro - Wander Connect](connect/intro.md)
* [Options](connect/options.md)
* [Properties](connect/properties.md)
* [Methods](connect/methods.md)
* [Event Callbacks](connect/event-callbacks.md)
* [Advanced Customization](connect/advanced-customization.md)
* [Custom UI](connect/custom-ui.md)

## 🔭 Examples

* [Playground](https://playground.othent.io/)
* [Applications](https://www.wander.app/apps)

## ❔ How To

* [Subsidizing Payments](how-to/subsidizing-payments.md)

## 🧪 API

* [Intro - Wander Injected API](api/intro.md)
* [Events](api/events.md)
* [Connect](api/connect.md)
* [Disconnect](api/disconnect.md)
* [Get active address](api/get-active-address.md)
* [Get active public key](api/get-active-public-key.md)
* [Get all addresses](api/get-all-addresses.md)
* [Get wallet names](api/get-wallet-names.md)
* [Get Wander tier info](api/get-wander-tier-info.md)
* [Sign Transaction](api/sign.md)
* [Dispatch Transaction](api/dispatch.md)
* [Sign DataItem](api/sign-dataitem.md)
* [Batch Sign DataItem](api/batch-sign-dataitem.md)
* [Sign message](api/sign-message.md)
* [Verify message](api/verify-message.md)
* [Private hash](api/private-hash.md)
* [User Tokens](api/user-tokens.md)
* [Token Balance](api/token-balance.md)
* [Encrypt](api/encrypt.md)
* [Decrypt](api/decrypt.md)
* [Crypto signature](api/signature.md)
* [Subscriptions](api/subscriptions.md)
* [Retrive permissions](api/get-permissions.md)
* [Retrive Gateway Config](api/get-arweave-config.md)

## ⛏️ Developer tooling

* [Wander Devtools](devtools/wander-devtools.md)
* [ArLocal Devtools](devtools/arlocal-devtools.md)

## 📚 External libraries

* [Arweave Wallet Kit](https://docs.arweavekit.com/arweave-wallet-kit/introduction)
* [arweave-js](https://npmjs.com/arweave)

***

* [🌐 Wander.app](https://wander.app)

===== END FILE: SUMMARY.md =====

===== FILE: api/batch-sign-dataitem.md =====
---
description: Wander Injected API batchSignDataItem() function
---

# Batch Sign DataItem

The batchSignDataItem() function allows you to create and sign an array of data item objects, compatible with [`arbundles`](https://www.npmjs.com/package/@dha-team/arbundles). These data items can then be submitted to an [ANS-104](https://github.com/ArweaveTeam/arweave-standards/blob/master/ans/ANS-104.md) compatible bundler.

| Argument    | Type                                                                                                                     | Description                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| `dataItems` | [`DataItem[]`](batch-sign-dataitem.md#data-item)                                                                         | An array of data items to sign        |
| `options?`  | [`SignatureOptions`](https://github.com/ArweaveTeam/arweave-js/blob/master/src/common/lib/crypto/crypto-interface.ts#L3) | Arweave transaction signature options |

{% hint style="info" %}
**Note:** This function requires the [`SIGN_TRANSACTION`](connect.md#permissions) permission.
{% endhint %}

{% hint style="info" %}
**Note:** The `options` argument is optional, if it is not provided, the extension will use the default signature options (default salt length) to sign the transaction.
{% endhint %}

{% hint style="warning" %}
**Warning:** This function is designed to sign multiple small data items. There is a limit of 200kb total for the function. Please ensure that the combined size of all data items does not exceed this limit.
{% endhint %}

{% hint style="warning" %}
**Warning:** The function returns an array of buffers of the signed data items. You'll need to manually load them into an [`arbundles`](https://www.npmjs.com/package/@dha-team/arbundles) `DataItem` instance as seen in the [example usage](batch-sign-dataitem.md#example-usage).
{% endhint %}

## Data item

This function requires valid data item objects, like so:

```typescript
export interface DataItem[] {
  data: string | Uint8Array;
  target?: string;
  anchor?: string;
  tags?: {
    name: string;
    value: string;
  }[];
}
```

## Example usage

```ts
import { DataItem } from "@dha-team/arbundles";

// connect to the extension
await window.arweaveWallet.connect(["SIGN_TRANSACTION"]);

// sign the data item
const signed = await window.arweaveWallet.batchSignDataItem([
  {
    data: "This is an example transaction 1",
    tags: [
      {
        name: "Content-Type",
        value: "text/plain",
      },
    ],
  },
  {
    data: "This is an example transaction 2",
    tags: [
      {
        name: "Content-Type",
        value: "text/plain",
      },
    ],
  },
]);

// load the result into a DataItem instance
const dataItems = signed.map((buffer) => new DataItem(buffer));

// now you can submit them to a bundler
for (const dataItem of dataItems) {
  await fetch(`https://upload.ardrive.io/v1/tx`, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
    },
    body: dataItem.getRaw(),
  });
}
```

===== END FILE: api/batch-sign-dataitem.md =====

===== FILE: api/connect.md =====
---
description: Wander Injected API connect() function
---

# Connect

To use the different functionalities the Wander API provides, you need to request permissions from the user to interact with their wallets. Each API function has their own permission(s), which can be requested at any time with the `connect()` function.

| Argument      | Type                                                       | Description                                                                       |
| ------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `permissions` | [`Array<PermissionType>`](connect.md#permissions)          | An array of permission to request from the user (at least one has to be included) |
| `appInfo?`    | [`AppInfo`](connect.md#additional-application-information) | Additional information about the app                                              |
| `gateway?`    | [`Gateway`](connect.md#custom-gateway-config)              | Custom gateway config                                                             |

{% hint style="info" %}
**Note:** The `appInfo` argument is optional, if it is not provided, the extension will use your site's title and favicon as application data.
{% endhint %}

{% hint style="info" %}
**Note:** The `gateway` argument is optional, if it is not provided, the extension will use the default `arweave.net` gateway for the executed API. functions
{% endhint %}

## Permissions

Wander requires specific permissions from the user for each interaction that involves the usage of their wallet.

| Permission              | Description                                                           |
| ----------------------- | --------------------------------------------------------------------- |
| `ACCESS_ADDRESS`        | Allow the app to get the active wallet's address                      |
| `ACCESS_PUBLIC_KEY`     | Enable the app to access the active wallet's public key               |
| `ACCESS_ALL_ADDRESSES`  | Enable the app to access all wallet addresses added to Wander         |
| `SIGN_TRANSACTION`      | Allow the app to sign an Arweave transaction (Base layer)             |
| `ENCRYPT`               | Enable the app to encrypt data with the user's wallet through Wander  |
| `DECRYPT`               | Allow the app to decrypt data encrypted with the user's wallet        |
| `SIGNATURE`             | Allow the app to sign messages with the user's wallet through Wander  |
| `ACCESS_ARWEAVE_CONFIG` | Enable the app to access the current gateway config                   |
| `DISPATCH`              | Allow the app to dispatch a transaction (bundle or base layer)        |
| `ACCESS_TOKENS`         | Allow the app to access all tokens and token balances added in Wander |

## Additional application information

You can provide your application's name and logo to the extension. Please make sure the app name only includes the **name of your application** and the logo is **high quality** and clearly visible on dark and light backgrounds.

```ts
interface AppInfo {
  name?: string; // optional application name
  logo?: string; // optional application logo url
}
```

## Custom gateway config

If your application requires the usage of a special gateway or you want to test with an [ArLocal](https://github.com/textury/arlocal) testnet gateway, you'll have to provide some information about these when connecting to Wander.

```ts
interface Gateway {
  host: string;
  port: number;
  protocol: "http" | "https";
}
```

## Example usage

```ts
// connect to the extension
await window.arweaveWallet.connect(
  // request permissions to read the active address
  ["ACCESS_ADDRESS"],
  // provide some extra info for our app
  {
    name: "Super Cool App",
    logo: "https://arweave.net/jAvd7Z1CBd8gVF2D6ESj7SMCCUYxDX_z3vpp5aHdaYk",
  },
  // custom gateway
  {
    host: "g8way.io",
    port: 443,
    protocol: "https",
  }
);
```

===== END FILE: api/connect.md =====

===== FILE: api/decrypt.md =====
---
description: Wander Injected API decrypt() function
---

# Decrypt

Data [encrypted with the user's wallet](encrypt.md) should be accessible by the owner of the private key. The `decrypt()` function allows applications to decrypt any piece of data encrypted with the user's private key, similarly to the [webcrypto encrypt API](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/decrypt).

| Argument    | Type                                                                                                                                                                                                                                                                                                                                   | Description                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `data`      | [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) or [`DataView`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView)  | The encrypted data to be decrypted with the user's private key                     |
| `algorithm` | [`RsaOaepParams`](https://developer.mozilla.org/en-US/docs/Web/API/RsaOaepParams), [`AesCtrParams`](https://developer.mozilla.org/en-US/docs/Web/API/AesCtrParams), [`AesCbcParams`](https://developer.mozilla.org/en-US/docs/Web/API/AesCbcParams) or [`AesGcmParams`](https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams) | An object specifying the algorithm to be used and any extra parameters if required |

{% hint style="info" %}
**Note:** This function requires the [`DECRYPT`](connect.md#permissions) permission.
{% endhint %}

## Example usage

```typescript
// connect to the extension
await window.arweaveWallet.connect(["ENCRYPT", "DECRYPT"]);

// encrypt data using RSA-OAEP
const encrypted = await arweaveWallet.encrypt(
    new TextEncoder().encode("This message will be encrypted"),
    { name: "RSA-OAEP" }
);

console.log("Encrypted bytes:", encrypted);

// now decrypt the same data using
// the same algorithm
const decrypted = await arweaveWallet.decrypt(
    encrypted,
    { name: "RSA-OAEP" }
);

console.log(
    "Decrypted data:",
    new TextDecoder().decode(decrypted)
);
```

### Old (deprecated) usage

```ts
// connect to the extension
await window.arweaveWallet.connect(["ENCRYPT", "DECRYPT"]);

// encrypt data
const encrypted = await window.arweaveWallet.encrypt(
  new TextEncoder().encode("This message will be encrypted"),
  {
    algorithm: "RSA-OAEP",
    hash: "SHA-256",
  }
);

console.log("Encrypted bytes:", encrypted);

// decrypt data
const decrypted = await window.arweaveWallet.decrypt(
  encrypted,
  {
    algorithm: "RSA-OAEP",
    hash: "SHA-256",
  }
);

console.log("Decrypted data:", new TextDecoder().decode(decrypted));
```

===== END FILE: api/decrypt.md =====

===== FILE: api/disconnect.md =====
---
description: Wander Injected API disconnect() function
---

# Disconnect

To end the current Wander session for the user, you can disconnect from the extension, using the `disconnect()` function. This removes all permissions from your site and Wander will no longer store application and gateway data related to your application. To use the Injected API again, you'll need to [reconnect](connect.md).

{% hint style="info" %}
**Note:** It is recommended to only use this function once the user clicks a clearly marked "Disconnect" button in your application.
{% endhint %}

## Example usage

```ts
// connect to the extension
await window.arweaveWallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"]);

// disconnect from the extension
await window.arweaveWallet.disconnect();
```

===== END FILE: api/disconnect.md =====

===== FILE: api/dispatch.md =====
---
description: Wander Injected API dispatch() function
---

# Dispatch Transaction

The `dispatch()` function allows you to quickly sign and send a transaction to the network in a bundled format. It is best for smaller datas and contract interactions. If the bundled transaction cannot be submitted, it will fall back to a base layer transaction. The function returns the [result](dispatch.md#dispatch-result) of the API call.

| Argument      | Type                                                                                                                     | Description                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `transaction` | [`Transaction`](https://github.com/arweaveTeam/arweave-js#transactions)                                                  | A valid Arweave transaction instance (**without a keyfile**) |
| `options?`    | [`SignatureOptions`](https://github.com/ArweaveTeam/arweave-js/blob/master/src/common/lib/crypto/crypto-interface.ts#L3) | Arweave transaction signature options                        |

{% hint style="info" %}
**Note:** This function requires the [`DISPATCH`](connect.md#permissions) permission.
{% endhint %}

{% hint style="info" %}
**Note:** The `options` argument is optional, if it is not provided, the extension will use the default signature options (default salt length) to sign the transaction.
{% endhint %}

{% hint style="warning" %}
**Note:** If you are trying to sign a larger piece of data (5 MB <), make sure to notify the user to not switch / close the browser tab. Larger transactions are split into chunks in the background and will take longer to sign.
{% endhint %}

{% hint style="warning" %}
**Note:** The function uses the default bundler node set by the user or the extension. Consider using the [`signDataItem()`](sign-dataitem.md) function to submit data to a custom bundler.&#x20;
{% endhint %}

## Dispatch result

The `dispatch()` function returns the result of the operation, including the ID of the submitted transaction, as well as if it was submitted in a bundle or on the base layer.

```ts
export interface DispatchResult {
  id: string;
  type?: "BASE" | "BUNDLED";
}
```

## Example usage

```ts
import Arweave from "arweave";

// create arweave client
const arweave = new Arweave({
  host: "ar-io.net",
  port: 443,
  protocol: "https"
});

// connect to the extension
await window.arweaveWallet.connect(["DISPATCH"]);

// create a transaction
const transaction = await arweave.createTransaction({
  data: '<html><head><meta charset="UTF-8"><title>Hello permanent world! This was signed via Wander!!!</title></head><body></body></html>'
});

// dispatch the tx
const res = await window.arweaveWallet.dispatch(transaction);

console.log(`The transaction was dispatched as a ${res.type === "BUNDLED" ? "bundled" : "base layer"} Arweave transaction.`)
```

===== END FILE: api/dispatch.md =====

===== FILE: api/encrypt.md =====
---
description: Wander Injected API encrypt() function
---

# Encrypt

Some applications (such as private file storage apps, mail clients, messaging platforms) might want to upload content to Arweave that is encrypted and only accessible by the user via their private key. The `encrypt()` function does just that: it encrypts data with the active private key and returns the encrypted bytes, similarly to the [webcrypto encrypt API](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt).

| Argument    | Type                                                                                                                                                                                                                                                                                                                                   | Description                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `data`      | [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) or [`DataView`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView)  | The data to be encrypted with the user's private key                               |
| `algorithm` | [`RsaOaepParams`](https://developer.mozilla.org/en-US/docs/Web/API/RsaOaepParams), [`AesCtrParams`](https://developer.mozilla.org/en-US/docs/Web/API/AesCtrParams), [`AesCbcParams`](https://developer.mozilla.org/en-US/docs/Web/API/AesCbcParams) or [`AesGcmParams`](https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams) | An object specifying the algorithm to be used and any extra parameters if required |

{% hint style="info" %}
**Note:** This function requires the [`ENCRYPT`](connect.md#permissions) permission.
{% endhint %}

## Example usage

```typescript
// connect to the extension
await window.arweaveWallet.connect(["ENCRYPT"]);

// encrypt data using RSA-OAEP
const encrypted = await arweaveWallet.encrypt(
    new TextEncoder().encode("This message will be encrypted"),
    { name: "RSA-OAEP" }
);

console.log("Encrypted bytes:", encrypted);
```

### Old (deprecated) usage

```ts
// connect to the extension
await window.arweaveWallet.connect(["ENCRYPT"]);

// encrypt data
const encrypted = await window.arweaveWallet.encrypt(
  new TextEncoder().encode("This message will be encrypted"),
  {
    algorithm: "RSA-OAEP",
    hash: "SHA-256",
  }
);

console.log("Encrypted bytes", encrypted);
```

===== END FILE: api/encrypt.md =====

===== FILE: api/events.md =====
---
description: Wander DOM events
---

# Events

Wander provides useful custom events to track the state of the extension. These events implement the [`CustomEvent`](https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events#adding_custom_data_%E2%80%93_customevent) browser API.

## `arweaveWalletLoaded` event

This event is dispatched once the Wander Injected API has been initialized in the `window` object. Before this event is fired, you cannot interact with Wander and the `window.arweaveWallet` object will be undefined.

### Example

```ts
addEventListener("arweaveWalletLoaded", (e) => {
  const { permissions } = e.detail;

  if (permissions === 0) {
    await window.arweaveWallet.connect(["ACCESS_ADDRESS"]);
  } else {
    // We can already interact with the wallet...
  }
});
```

## `walletSwitch` event

This event is fired when the user manually switches their active wallet. The even also includes the new active wallet's address, if the user allowed the `ACCESS_ADDRESS` and the `ACCESS_ALL_ADDRESSES` permissions.

### Example

```ts
addEventListener("walletSwitch", (e) => {
  const { address } = e.detail;

  // Handle wallet switch...
});
```

## Event emitter

The event emitter is available under `window.arweaveWallet.events` as a more advanced event system for the extension.

{% hint style="info" %}
**Note:** This documentation is incomplete and the feature is experimental.
{% endhint %}

===== END FILE: api/events.md =====

===== FILE: api/get-active-address.md =====
---
description: Wander Injected API getActiveAddress() function
---

# Get active address

In order to identify the user's wallet, your application might need to obtain their crypto address. Arweave addresses are derived from the user's public key. The `getActiveAddress()` function returns the address that belongs to the wallet that is currently being used in Wander.

{% hint style="info" %}
**Note:** This function requires the [`ACCESS_ADDRESS`](connect.md#permissions) permission.
{% endhint %}

## Example usage

```ts
// connect to the extension
await window.arweaveWallet.connect(["ACCESS_ADDRESS"]);

// obtain the user's wallet address
const userAddress = await window.arweaveWallet.getActiveAddress();

console.log("Your wallet address is", userAddress);
```

===== END FILE: api/get-active-address.md =====

===== FILE: api/get-active-public-key.md =====
---
description: ArConnect Injected API getActivePublicKey() function
---

# Get active public key

This function allows you to get the public key of the currently active wallet in Wander.

{% hint style="info" %}
**Note:** This function requires the [`ACCESS_PUBLIC_KEY`](connect.md#permissions) permission.
{% endhint %}

## Example usage

```ts
// connect to the extension
await window.arweaveWallet.connect(["ACCESS_PUBLIC_KEY"]);

// obtain the user's public key
const publicKey = await window.arweaveWallet.getActivePublicKey();

console.log("JWK.n field is:", publicKey);

// create public key JWK
const publicJWK: JsonWebKey = {
    e: "AQAB",
    ext: true,
    kty: "RSA",
    n: publicKey
};

// import it with webcrypto, etc.
```

===== END FILE: api/get-active-public-key.md =====

===== FILE: api/get-all-addresses.md =====
---
description: Wander Injected API getAllAddresses() function
---

# Get all addresses

Wander provides enhanced key management for your Arweave wallets. Because of this, the extension might store more than one wallet and your application can take advantage of that. For example, this feature can make it easier for your app to transfer tokens between the user's addresses. The `getAllAddresses()` function returns an array of addresses added to Wander.

{% hint style="info" %}
**Note:** This function requires the [`ACCESS_ALL_ADDRESSES`](connect.md#permissions) permission.
{% endhint %}

## Example usage

```ts
// connect to the extension
await window.arweaveWallet.connect(["ACCESS_ADDRESS", "ACCESS_ALL_ADDRESSES"]);

// get all wallet addresses added to ArConnect
const addresses = await window.arweaveWallet.getAllAddresses();

// obtain the user's active wallet address
const activeAddress = await window.arweaveWallet.getActiveAddress();

console.log("Your wallet address is", activeAddress);
console.log("You can transfer your assets to your other addresses:\n", addresses.filter((addr) => addr !== activeAddress).join("\n"));
```

===== END FILE: api/get-all-addresses.md =====

===== FILE: api/get-arweave-config.md =====
---
description: Wander Injected API getArweaveConfig() function
---

# Retrive Gateway Config

It can be useful to know what Arweave gateway the extension uses for your application. You can set this when [connecting](connect.md#custom-gateway-config) your application to Wander, but the user can always update it later. Using the `getArweaveConfig()`, you can make sure your application works, no matter what gateway the extension uses.

{% hint style="info" %}
**Note:** This function requires the [`ACCESS_ARWEAVE_CONFIG`](connect.md#permissions) permission.
{% endhint %}

## Example usage

```ts
import Arweave from "arweave";

// connect to the extension
await window.arweaveWallet.connect(["ACCESS_ARWEAVE_CONFIG"]);

// get the current gateway
const gateway = await window.arweaveWallet.getArweaveConfig();

// setup an arweave-js client using
// the obtained gateway 
const client = new Arweave(gateway);
```

===== END FILE: api/get-arweave-config.md =====

===== FILE: api/get-permissions.md =====
---
description: Wander Injected API getPermissions() function
---

# Retrive permissions

As discussed [here](connect.md#permissions), Wander requires a specific type of permission for each API function that involves an action with the user's wallet. It is important for an application to be aware of the permissions given to them by the user. The `getPermissions()` function returns an array of permissions given to the current application. If the array is empty, it means that the app has not yet connected to the extension.

## Example usage

```ts
// get permissions
const permissions = await window.arweaveWallet.getPermissions();

console.log("The app has the following permissions:", permissions);
```

===== END FILE: api/get-permissions.md =====

===== FILE: api/get-wallet-names.md =====
---
description: Wander Injected API getWalletNames() function
---

# Get wallet names

In Wander, each wallet has a nickname. This is either the user's [ArNS](https://arns.app/) name, or a user-given nickname. To provide better UX, you can retrive these names and display them for the user, so they can easily recognize which wallet they're using. The `getWalletNames()` function returns an object, where the object keys are the wallet addresses and the values are the nicknames.

{% hint style="info" %}
**Note:** This function requires the [`ACCESS_ALL_ADDRESSES`](connect.md#permissions) permission.
{% endhint %}

## Example usage

```ts
// connect to the extension
await window.arweaveWallet.connect(["ACCESS_ADDRESS", "ACCESS_ALL_ADDRESSES"]);

// get all wallet names from Wander
const walletNames = await window.arweaveWallet.getWalletNames();

// obtain the user's active wallet address
const activeAddress = await window.arweaveWallet.getActiveAddress();

console.log("Your active wallet's nickname is", walletNames[activeAddress]);
```

===== END FILE: api/get-wallet-names.md =====

===== FILE: api/get-wander-tier-info.md =====
---
description: Wander Injected API getWanderTierInfo() function
---

# Get Wander tier info

Some applications may request access to the Wander tier information of the user. The `getWanderTierInfo()` function returns detailed information about the user's tier, balance, rank, and other related metrics in the Wander ecosystem.

{% hint style="info" %}
**Note:** This function requires the [`ACCESS_ADDRESS`](connect.md#permissions) permission.
{% endhint %}

## Result

The `getWanderTierInfo()` function returns an object containing comprehensive tier information for the user.

{% hint style="warning" %}
**Note**: This function throws an error if there is an issue retrieving the tier information. Please make sure to handle such cases in your code.
{% endhint %}

```typescript
type Tier = "Prime" | "Edge" | "Reserve" | "Select" | "Core";

interface WanderTierInfo {
  tier: Tier;                    // User's current tier
  balance: string;               // User's WNDR token balance from the snapshot
  rank: "" | number;             // User's rank in the balance leaderboard (empty string if not ranked)
  progress: number;              // User's progress within the tier system (0-100)
  snapshotTimestamp: number;     // Timestamp of the last snapshot update (in milliseconds)
  totalHolders: number;          // Total number of WNDR token holders in the snapshot
}
```

## Example usage

```ts
// Connect to the extension and request access to the ACCESS_ADDRESS permission
await window.arweaveWallet.connect(["ACCESS_ADDRESS"]);

try {
  // Retrieve the tier information of the user
  const tierInfo = await window.arweaveWallet.getWanderTierInfo();
  
  console.log("Tier:", tierInfo.tier);
  console.log("Balance:", tierInfo.balance);
  console.log("Rank:", tierInfo.rank);
  console.log("Progress:", tierInfo.progress);
  console.log("Snapshot timestamp:", tierInfo.snapshotTimestamp);
  console.log("Total holders:", tierInfo.totalHolders);
} catch (error) {
  console.error("Error fetching tier information:", error);
}
```

## Alternative implementation via dryrun

For applications that need to query tier information for any wallet address (not just the connected user), you can also use the dryrun approach to query the Wander leaderboard process directly.

{% hint style="info" %}
**Note:** The tier information is updated every 24 hours at 4:00 PM GMT. Make sure to cache the results using the `snapshotTimestamp` to avoid unnecessary calls to the process.
{% endhint %}

### Single wallet query

```ts
import { dryrun } from "@permaweb/aoconnect";

type Tier = "Prime" | "Edge" | "Reserve" | "Select" | "Core";

interface WanderTierInfo {
  tier: Tier;                    
  balance: string;               
  rank: "" | number;             
  progress: number;              
  snapshotTimestamp: number;     
  totalHolders: number;          
}

type WanderTierInfoFromApi = Omit<WanderTierInfo, "tier"> & {
  tier: number;
}

const TIER_ID_TO_NAME = {
  1: "Prime",
  2: "Edge", 
  3: "Reserve",
  4: "Select",
  5: "Core",
} as const;

function isValidTierInfo(data: WanderTierInfoFromApi): data is WanderTierInfoFromApi {
  return (
    data &&
    typeof data === "object" &&
    typeof data.tier === "number" &&
    typeof data.balance === "string" &&
    typeof data.rank === "number" &&
    typeof data.progress === "number" &&
    typeof data.snapshotTimestamp === "number" &&
    typeof data.totalHolders === "number"
  );
}

// Single wallet query
async function getWanderTierInfo(walletAddress: string): Promise<WanderTierInfo> {
  let data: WanderTierInfoFromApi;
  try {
    const response = await fetch(`https://cache.wander.app/api/tier-info?address=${walletAddress}`);
    if (!response.ok) {
      throw new Error("Failed to fetch tier info from cache API");
    }

    const responseData = await response.json();

    if (!isValidTierInfo(responseData)) {
      throw new Error("Invalid tier info data format from cache API");
    }

    data = responseData;
  } catch {
    const dryrunRes = await dryrun({
      Owner: walletAddress,
      process: "rkAezEIgacJZ_dVuZHOKJR8WKpSDqLGfgPJrs_Es7CA",
      tags: [{ name: "Action", value: "Get-Wallet-Info" }]
    });

    const message = dryrunRes.Messages?.[0];
    const parsedData = JSON.parse(message?.Data || "{}");

    if (!isValidTierInfo(parsedData)) {
      throw new Error("Invalid tier info data from WNDR tier process");
    }

    data = parsedData;
  }

  const tierInfo: WanderTierInfo = {
    ...data,
    tier: TIER_ID_TO_NAME[data.tier as keyof typeof TIER_ID_TO_NAME],
  };

  return tierInfo;
}

const walletAddress = "your-wallet-address-here";
try {
  const tierInfo = await getWanderTierInfo(walletAddress);
  console.log("Tier information:", tierInfo);
} catch (error) {
  console.error("Failed to retrieve tier information:", error);
}
```

### Batch wallet query

```ts
import { dryrun } from "@permaweb/aoconnect";

type Tier = "Prime" | "Edge" | "Reserve" | "Select" | "Core";

interface WanderTierInfo {
  tier: Tier;                    
  balance: string;               
  rank: "" | number;             
  progress: number;              
  snapshotTimestamp: number;     
  totalHolders: number;          
}

type WanderTierInfoFromApi = Omit<WanderTierInfo, "tier"> & {
  tier: number;
}

const TIER_ID_TO_NAME = {
  1: "Prime",
  2: "Edge", 
  3: "Reserve",
  4: "Select",
  5: "Core",
} as const;

// Batch wallet query
async function getBatchWanderTierInfo(walletAddresses: string[]): Promise<Record<string, WanderTierInfo>> {
  let data: Record<string, WanderTierInfoFromApi>;

  try {
    const response = await fetch(`https://cache.wander.app/api/tier-info?addresses=${walletAddresses.join(",")}`);
    if (!response.ok) {
      throw new Error("Failed to fetch tier info from cache API");
    }

    data = await response.json();
  } catch {
    const dryrunRes = await dryrun({
      process: "rkAezEIgacJZ_dVuZHOKJR8WKpSDqLGfgPJrs_Es7CA",
      data: JSON.stringify(walletAddresses),
      tags: [{ name: "Action", value: "Get-Wallets-Info" }],
    });

    if (dryrunRes.Error) throw new Error(dryrunRes.Error);

    const message = dryrunRes.Messages?.[0];
    data = JSON.parse(message?.Data || "{}");
  }

  const batchTierInfo: Record<string, WanderTierInfo> = {};

  for (const [walletAddress, walletData] of Object.entries<any>(data)) {
    batchTierInfo[walletAddress] = {
      ...walletData,
      tier: TIER_ID_TO_NAME[walletData.tier as keyof typeof TIER_ID_TO_NAME],
    };
  }

  return batchTierInfo;
}

const walletAddresses = [
  "wallet-address-1",
  "wallet-address-2", 
  "wallet-address-3"
];

try {
  const batchTierInfo = await getBatchWanderTierInfo(walletAddresses);
  
  for (const [address, tierInfo] of Object.entries(batchTierInfo)) {
    console.log(`Tier info for ${address}: `, tierInfo);
  }
} catch (error) {
  console.error("Failed to retrieve batch tier information:", error);
}
```

===== END FILE: api/get-wander-tier-info.md =====

===== FILE: api/intro.md =====
---
description: Introducing the Wander Injected API
---

# Intro

<div data-full-width="false"><figure><img src="../.gitbook/assets/Wander Docs-API.png" alt=""><figcaption></figcaption></figure></div>

The Wander API is a JavaScript object, injected into each browser tab. To interact with it, you simply need to call one of the functions in the `window.arweaveWallet` object.

## Basic usage

To use Wander in your application, you don't need to integrate or learn how the Wander Injected API works. Using [`arweave-js`](https://npmjs.com/arweave), you can easily sign a transaction through Wander in the background:

```ts
// 1. Connect your app to the wallet:
await arweaveWallet.connect([...]);

// 2. Create Arweave transaction:
const tx = await arweave.createTransaction({ ... });

// 3. Sign transaction:
await arweave.transactions.sign(tx);

// 4. TODO: Handle (e.g. post) signed transaction...
```

When signing a transaction through [`arweave-js`](https://npmjs.com/arweave), you'll need to omit the second argument of the `sign()` function, or set it to `"use_wallet"`. This will let the package know to use the extension in the background to sign the transaction.

Once the transaction is signed, you can safely post it to the network.

## Advanced usage

The Wander Injected API provides extra functionalities in case you wish to utilize the user's wallet to its full extent securely. These features are not integrated in the `arweave-js` package, but can be useful to further customize your app. The above mentioned `window.arweaveWallet` object holds the api functions necessary for this.

Each function is described in detail in the following pages.

{% hint style="danger" %}
**Please remember:** to interact with the API, make sure that the `arweaveWalletLoaded` event has already been fired. Read more about that [here](events.md#arweavewalletloaded-event).
{% endhint %}

## TypeScript types

To support Wander types for `window.arweaveWallet`, you can install the npm package `arconnect`, like this:

{% hint style="info" %}
_Wander was formerly know as ArConnect.  There are some API references that still use ArConnect_
{% endhint %}

```sh
npm i -D arconnect
```

or

```sh
yarn add -D arconnect
```

To add the types to your project, you should either include the package in your `tsconfig.json`, or add the following to your `env.d.ts` file:

```ts
/// <reference types="arconnect" />
```

## Additional Injected API fields

The Wander Injected API provides some additional information about the extension. You can retrieve the wallet version (`window.arweaveWallet.walletVersion`) and you can even verify that the currently used wallet API indeed belongs to Wander using the wallet name (`window.arweaveWallet.walletName`).

```ts
addEventListener("arweaveWalletLoaded", () => {
  console.log(`You are using the ${window.arweaveWallet.walletName} wallet.`);
  console.log(`Wallet version is ${window.arweaveWallet.walletVersion}`);
});
```

===== END FILE: api/intro.md =====

===== FILE: api/private-hash.md =====
---
description: Wander Injected API privateHash() function
---

# Private hash

The `privateHash()` function allows you to create deterministic secrets (hashes) from some data.

| Argument  | Type                                            | Description                |
| --------- | ----------------------------------------------- | -------------------------- |
| `data`    | `ArrayBuffer`                                   | The data to hash           |
| `options` | [`SignMessageOptions`](sign-message.md#options) | Configuration for the hash |

{% hint style="info" %}
**Note:** This function requires the [`SIGNATURE`](connect.md#permissions) permission.
{% endhint %}

## Example usage

```ts
// connect to the extension
await window.arweaveWallet.connect(["SIGNATURE"]);

// data to be hashed
const data = new TextEncoder().encode("The hash of this msg will be signed.");

// create the hash using the active wallet
const hash = await window.arweaveWallet.privateHash(
    data,
    { hashAlgorithm: "SHA-256" }
);

console.log("Data hash is", hash);
```

===== END FILE: api/private-hash.md =====

===== FILE: api/sign-dataitem.md =====
---
description: Wander Injected API signDataItem() function
---

# Sign DataItem

The signDataItem() function allows you to create and sign a data item object, compatible with [`arbundles`](https://www.npmjs.com/package/@dha-team/arbundles). These data items can then be submitted to an [ANS-104](https://github.com/ArweaveTeam/arweave-standards/blob/master/ans/ANS-104.md) compatible bundler.

| Argument   | Type                                                                                                                     | Description                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| `dataItem` | [`DataItem`](sign-dataitem.md#data-item)                                                                                 | The bundled data item to sign         |
| `options?` | [`SignatureOptions`](https://github.com/ArweaveTeam/arweave-js/blob/master/src/common/lib/crypto/crypto-interface.ts#L3) | Arweave transaction signature options |

{% hint style="info" %}
**Note:** This function requires the [`SIGN_TRANSACTION`](connect.md#permissions) permission.
{% endhint %}

{% hint style="info" %}
**Note:** The `options` argument is optional, if it is not provided, the extension will use the default signature options (default salt length) to sign the transaction.
{% endhint %}

{% hint style="warning" %}
**Warning:** The function returns a buffer of the signed data item. You'll need to manually load it into an [`arbundles`](https://www.npmjs.com/package/@dha-team/arbundles) `DataItem` instance as seen in the [example usage](sign-dataitem.md#example-usage).
{% endhint %}

## Data item

This function requires a valid data item object, like so:

```typescript
export interface DataItem {
  data: string | Uint8Array;
  target?: string;
  anchor?: string;
  tags?: {
    name: string;
    value: string;
  }[];
}
```

## Example usage

```ts
import { DataItem } from "@dha-team/arbundles";

// connect to the extension
await window.arweaveWallet.connect(["SIGN_TRANSACTION"]);

// sign the data item
const signed = await window.arweaveWallet.signDataItem({
  data: "This is an example data",
  tags: [
    {
      name: "Content-Type",
      value: "text/plain",
    },
  ],
});

// load the result into a DataItem instance
const dataItem = new DataItem(signed);

// now you can submit it to a bunder
await fetch(`https://upload.ardrive.io/v1/tx`, {
  method: "POST",
  headers: {
    "Content-Type": "application/octet-stream",
  },
  body: dataItem.getRaw(),
});
```

===== END FILE: api/sign-dataitem.md =====

===== FILE: api/sign-message.md =====
---
description: Wander Injected API signMessage() function
---

# Sign message

This function allows creating a cryptographic signature for any piece of data for later validation.

| Argument   | Type                                            | Description                            |
| ---------- | ----------------------------------------------- | -------------------------------------- |
| `data`     | `ArrayBuffer`                                   | The data to generate the signature for |
| `options?` | [`SignMessageOptions`](sign-message.md#options) | Configuration for the signature        |

{% hint style="info" %}
**Note:** This function requires the [`SIGNATURE`](connect.md#permissions) permission.
{% endhint %}

{% hint style="warning" %}
**Note**: This function should only be used to allow data validation. It cannot be used for on-chain transactions, interactions or bundles, for security reasons. Consider implementing [`sign()`](sign.md), [`signDataItem()`](sign-dataitem.md) or [dispatch()](dispatch.md).
{% endhint %}

{% hint style="warning" %}
**Note**: The function first hashes the input data for security reasons. We recommend using the built in [`verifyMessage()`](verify-message.md) function to validate the signature, or hashing the data the same way, before validation ([example](sign-message.md#verification-without-arconnect)).
{% endhint %}

{% hint style="info" %}
**Note:** The `options` argument is optional, if it is not provided, the extension will use the default signature options (default hash algorithm: `SHA-256`) to sign the data.
{% endhint %}

## Options

Currently Wander allows you to customize the hash algorithm (`SHA-256` by default):

```typescript
export interface SignMessageOptions {
  hashAlgorithm?: "SHA-256" | "SHA-384" | "SHA-512";
}
```

## Example usage

```ts
// connect to the extension
await window.arweaveWallet.connect(["SIGNATURE"]);

// message to be signed
const data = new TextEncoder().encode("The hash of this msg will be signed.");

// create signature
const signature = await window.arweaveWallet.signMessage(data);

// verify signature
const isValidSignature = await window.arweaveWallet.verifyMessage(data, signature);

console.log(`The signature is ${isValidSignature ? "valid" : "invalid"}`);
```

## Verification without Wander

You might encounter situations where you need to verify the signed message against an Wander generated signature, but the extension is not accessible or not installed (for e.g.: server side code, unsupported browser, etc.).

In these cases it is possible to validate the signature by hashing the message (with the algorithm you used when generating the signature through Wander) and verifying that against the Wander signature. This requires the message to be verified, the signature and the [wallet's public key](get-active-public-key.md). Below is the JavaScript (TypeScript) example implementation with the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API), using `SHA-256` hashing:

{% hint style="info" %}
_Wander was formerly know as ArConnect.  There are some API references that still use ArConnect_
{% endhint %}

```typescript
// connect to the extension
await window.arweaveWallet.connect(["SIGNATURE"]);

// message to be signed
const data = new TextEncoder().encode("The hash of this msg will be signed.");

// create signature
const signature = await window.arweaveWallet.signMessage(data);

/** This is where we start the verification **/
// hash the message (we used the default signMessage() options
// so the extension hashed the message using "SHA-256"
const hash = await crypto.subtle.digest("SHA-256", data);

// import public JWK
// we need the user's public key for this
const publicJWK: JsonWebKey = {
    e: "AQAB",
    ext: true,
    kty: "RSA",
    // !! You need to obtain this on your own !!
    // possible ways are: 
    // - getting from Wander if available
    // - storing it beforehand
    // - if the wallet has made any transactions on the Arweave network
    //   the public key is going to be the owner field of the mentioned
    //   transactions
    n: publicKey
};

// import public jwk for verification
const verificationKey = await crypto.subtle.importKey(
    "jwk",
    publicJWK,
    {
      name: "RSA-PSS",
      hash: "SHA-256"
    },
    false,
    ["verify"]
);

// verify the signature by matching it with the hash
const isValidSignature = await crypto.subtle.verify(
    { name: "RSA-PSS", saltLength: 32 },
    verificationKey,
    signature,
    hash
);

console.log(`The signature is ${isValidSignature ? "valid" : "invalid"}`);
```

===== END FILE: api/sign-message.md =====

===== FILE: api/sign.md =====
---
description: Wander Injected API sign() function
---

# Sign Transaction

To submit a transaction to the Arweave Network, it first has to be signed using a private key. The `sign()` function is meant to replicate the behavior of the `transactions.sign()` function of [`arweave-js`](https://github.com/arweaveTeam/arweave-js#sign-a-transaction), but instead of mutating the transaction object, it returns a new and signed transaction instance.

| Argument      | Type                                                                                                                     | Description                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `transaction` | [`Transaction`](https://github.com/arweaveTeam/arweave-js#transactions)                                                  | A valid Arweave transaction instance (**without a keyfile**) |
| `options?`    | [`SignatureOptions`](https://github.com/ArweaveTeam/arweave-js/blob/master/src/common/lib/crypto/crypto-interface.ts#L3) | Arweave transaction signature options                        |

{% hint style="info" %}
**Note:** This function requires the [`SIGN_TRANSACTION`](connect.md#permissions) permission.
{% endhint %}

{% hint style="info" %}
**Note:** The `options` argument is optional, if it is not provided, the extension will use the default signature options (default salt length) to sign the transaction.
{% endhint %}

{% hint style="warning" %}
**Tip:** A better alternative to this function is using the [`arweave-js`](https://github.com/arweaveTeam/arweave-js#sign-a-transaction) `transactions.sign()` instead. Just omit the second parameter (`JWK` key) when calling the method, and [`arweave-js`](https://github.com/arweaveTeam/arweave-js#sign-a-transaction) will automatically use Wander.
{% endhint %}

{% hint style="warning" %}
**Note:** If you are trying to sign a larger piece of data (5 MB <), make sure to notify the user to not switch / close the browser tab. Larger transactions are split into chunks in the background and will take longer to sign.
{% endhint %}

## Example usage

### With `arweave-js` (recommended)

```ts
import Arweave from "arweave";

// create arweave client
const arweave = new Arweave({
  host: "ar-io.net",
  port: 443,
  protocol: "https"
});

// connect to the extension
await window.arweaveWallet.connect(["SIGN_TRANSACTION"]);

// create a transaction
const transaction = await arweave.createTransaction({
  data: '<html><head><meta charset="UTF-8"><title>Hello permanent world! This was signed via Wander!!!</title></head><body></body></html>'
});

// sign using arweave-js
await arweave.transactions.sign(transaction);

// TODO: post the transaction to the network
```

### Directly using Wander

```ts
import Arweave from "arweave";

// create arweave client
const arweave = new Arweave({
  host: "ar-io.net",
  port: 443,
  protocol: "https"
});

// connect to the extension
await window.arweaveWallet.connect(["SIGN_TRANSACTION"]);

// create a transaction
let transaction = await arweave.createTransaction({
  data: '<html><head><meta charset="UTF-8"><title>Hello permanent world! This was signed via Wander!!!</title></head><body></body></html>'
});

// sign using arweave-js
const signedFields = await window.arweaveWallet.sign(transaction);

// update transaction fields with the
// signed transaction's fields
transaction.setSignature({
  id: signedFields.id,
  owner: signedFields.owner,
  reward: signedFields.reward,
  tags: signedFields.tags,
  signature: signedFields.signature
});

// TODO: post the transaction to the network
```

===== END FILE: api/sign.md =====

===== FILE: api/signature.md =====
---
description: Wander Injected API signature() function
---

# Crypto signature

{% hint style="danger" %}
**Deprecation warning:** The `signature()` function is deprecated in ArConnect 1.0.0. Read about the alternatives below.
{% endhint %}

## Alternatives

There are quite a few cases where you might need to generate a cryptographic signature for a piece of data or message so that you can verify them. The most common ones and their alternatives are the following:

* Generating a signature for a transaction: [`sign()`](sign.md)
* Generating a signature for a bundle data item: [`signDataItem()`](sign-dataitem.md) or [`dispatch()`](dispatch.md)
* Signing a message to later validate ownership: [`signMessage()`](sign-message.md) combined with [`verifyMessage()`](verify-message.md)

The safety of our users' wallets is our top priority, so we've decided to deprecate our `signature()` function, following the example of _Arweave.app_ and we expect other Arweave wallets now or in the future to do the same, so eventually, this should be a smooth transition to the new alternatives. We are sorry for any inconveniences caused by this change.

~~Often an application might need a piece of data that is created, authorized or confirmed by the owner of a wallet. The `signature()` function creates a cryptographical signature that allows applications to verify if a piece of data has been signed using a specific wallet. This function works similarly to the~~ [~~webcrypto sign API~~](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/sign)~~.~~

| Argument        | Type                                                                                                                                                                                                                                                                                                                                                      | Description                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| ~~`data`~~      | [~~`ArrayBuffer`~~](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)~~,~~ [~~`TypedArray`~~](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) ~~or~~ [~~`DataView`~~](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView) | ~~The encrypted data to be signed with the user's private key~~                        |
| ~~`algorithm`~~ | [~~`RsaPssParams`~~](https://developer.mozilla.org/en-US/docs/Web/API/RsaPssParams)~~, `AesCmacParams` or~~ [~~`EcdsaParams`~~](https://developer.mozilla.org/en-US/docs/Web/API/EcdsaParams)                                                                                                                                                             | ~~An object specifying the algorithm to be used and any extra parameters if required~~ |

{% hint style="info" %}
~~**Note:** This function requires the~~ [~~`SIGNATURE`~~](connect.md#permissions) ~~permission.~~
{% endhint %}

{% hint style="warning" %}
~~**Note:** Not to be confused with the~~ [~~`sign()`~~](sign.md) ~~function that is created to sign Arweave transactions.~~
{% endhint %}

## ~~Example usage~~

```ts
// connect to the extension
await window.arweaveWallet.connect(["SIGNATURE"]);

// sign data
const signature = await window.arweaveWallet.signature(new TextEncoder().encode("Data to sign"), {
  name: 'RSA-PSS',
  saltLength: 0,
});

console.log("The signature is", signature);
```

===== END FILE: api/signature.md =====

===== FILE: api/subscriptions.md =====
---
description: Wander Injected API subscription() function
---

# Subscriptions

Subscriptions is a feature that allows users to subscribe to applications and be charged on a periodic basis such as monthly, weekly, or quarterly. Users will be charged the moment they subscribe

<table><thead><tr><th width="283">Argument</th><th width="278">Type</th><th>Description</th></tr></thead><tbody><tr><td><code>arweaveAccountAddress</code></td><td><code>string</code></td><td>The account address where payments will be made</td></tr><tr><td><code>applicationName</code></td><td><code>string</code></td><td>The name of your application</td></tr><tr><td><code>subscriptionName</code></td><td><code>string</code></td><td>The name of the subscription</td></tr><tr><td><code>subscriptionManagementUrl</code></td><td><code>string</code></td><td>A URL where users are able to manage their subscriptions</td></tr><tr><td><code>subscriptionFeeAmount</code></td><td><code>number</code></td><td>The amount in AR to be paid each period</td></tr><tr><td><code>recurringPaymentFrequency</code></td><td><a href="subscriptions.md#recurring-payment-frequency"><code>RecurringPaymentFrequency</code></a></td><td>Frequency for period to be charged</td></tr><tr><td><code>subscriptionEndDate</code></td><td><code>Date</code></td><td>When the subscription ends</td></tr><tr><td><code>applicationIcon</code></td><td><code>string</code></td><td>URL where an image is hosted, ideally 48x48</td></tr></tbody></table>

{% hint style="info" %}
**Note:** This function requires the [`ACCESS_ALL_ADDRESSES`](connect.md#permissions) permission.
{% endhint %}

## Recurring Payment Frequency

This function requires a recurring frequency such as listed:

Recurring Payment Frequency

```typescript
export enum RecurringPaymentFrequency {
  QUARTERLY = "Quarterly",
  MONTHLY = "Monthly",
  WEEKLY = "Weekly",
  DAILY = "Daily",
}
```

## Example usage

{% hint style="info" %}
_Wander was formerly know as ArConnect. There are some API references that still use ArConnect_
{% endhint %}

```ts
// connect to the extension
await window.arweaveWallet.connect(["ACCESS_ALL_ADDRESSES"]);

// submit the subscription information
const subscription = await window.arweaveWallet.subscription({
  arweaveAccountAddress: "hY70z-mbKfDByqXh4y43ybSxReFVo1i9lB1dDdCkO_U",
  applicationName: "Wander",
  subscriptionName: "Wander Premium",
  subscriptionManagementUrl: "https://wander.app/premium",
  subscriptionFeeAmount: 0.5,
  recurringPaymentFrequency: "Monthly",
  subscriptionEndDate: new Date("2024-12-31"),
  applicationIcon: "https://wander.app/logo",
});

// Subscription will output the details and the initial payment txn
console.log("Subscription details with paymentHistory array:", subscription);
```

===== END FILE: api/subscriptions.md =====

===== FILE: api/token-balance.md =====
---
description: Wander Injected API tokenBalance() function
---

# Token Balance

Some applications may request access to the balance of a specific token in your wallet. The `tokenBalance()` function returns the balance of the token identified by its ID.

| Argument | Type   | Description                                    |
| -------- | ------ | ---------------------------------------------- |
| `id`     | string | The unique identifier (processId) of the token |

{% hint style="info" %}
**Note:** This function requires the [`ACCESS_TOKENS`](connect.md#permissions) permission.
{% endhint %}

## Result

The `tokenBalance()` function returns the balance of the requested token as a string.

{% hint style="warning" %}
**Note**: This function throws an error if there is an issue retrieving the balance. Please make sure to handle such cases in your code.
{% endhint %}

```typescript
export type TokenBalanceResult = string;
```

## Example usage

```ts
// Connect to the extension and request access to the ACCESS_TOKENS permission
await window.arweaveWallet.connect(["ACCESS_TOKENS"]);

// Retrieve the list of tokens owned by the user
const tokens = await window.arweaveWallet.userTokens();
console.log("Tokens owned by the user:", tokens);

try {
  // Retrieve the balance of a user token
  const tokenId = tokens[0].processId
  const balance = await window.arweaveWallet.tokenBalance(tokenId);
  console.log(`Balance of the token with ID ${tokenId}:`, balance);
} catch (error) {
  console.error("Error fetching token balance:", error);
}
```

===== END FILE: api/token-balance.md =====

===== FILE: api/user-tokens.md =====
---
description: Wander Injected API userTokens() function
---

# User Tokens

Some applications may request access to the tokens in your wallet and their associated balances. The `userTokens()` function returns the [result](user-tokens.md#result) from the API call.

| Argument   | Type                                          | Description                             |
| ---------- | --------------------------------------------- | --------------------------------------- |
| `options?` | [`UserTokensOptions`](user-tokens.md#options) | Optional settings for balance inclusion |

{% hint style="info" %}
**Note:** This function requires the [`ACCESS_TOKENS`](connect.md#permissions) permission.
{% endhint %}

{% hint style="info" %}
**Note:** The `options` argument is optional. If not provided, the balance will not be included in the result.
{% endhint %}

## Options

Currently Wander allows you to customize the balance fetching behavior (`false` by default):

```typescript
export interface UserTokensOptions {
  fetchBalance?: boolean;
}
```

## Result

The `userTokens()` function returns an array of token information objects. If the `fetchBalance` option is set to `true`, each token object will include its balance. The `balance` property of the token object may be `null` if there is an issue retrieving it.

```typescript
export type UserTokensResult = Array<{
  Name?: string;
  Ticker?: string;
  Logo?: string;
  Denomination: number;
  processId: string;
  balance?: string | null;
}>
```

## Example usage

```ts
// Connect to the extension and request access to the ACCESS_TOKENS permission
await window.arweaveWallet.connect(["ACCESS_TOKENS"]);

// Retrieve the list of tokens owned by the user
const tokens = await window.arweaveWallet.userTokens();
console.log("Tokens owned by the user:", tokens);

// Retrieve the list of tokens owned by the user, including their balances
const tokensWithBalances = await window.arweaveWallet.userTokens({ fetchBalance: true });
console.log("Tokens with their balances:", tokensWithBalances);
```

===== END FILE: api/user-tokens.md =====

===== FILE: api/verify-message.md =====
---
description: Wander Injected API verifyMessage() function
---

# Verify message

This function allows verifying a cryptographic signature [created by ](sign-message.md)Wander.

| Argument     | Type                                            | Description                                                                                                  |
| ------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `data`       | `ArrayBuffer`                                   | The data to verify the signature for                                                                         |
| `signature`  | `ArrayBuffer \| string`                         | The signature to validate                                                                                    |
| `publicKey?` | `string`                                        | Arweave wallet `JWK.n` field, transaction owner field or [public key from Wander](get-active-public-key.md). |
| `options?`   | [`SignMessageOptions`](sign-message.md#options) | Configuration for the signature                                                                              |



{% hint style="info" %}
**Note:** This function requires the [`SIGNATURE`](connect.md#permissions) permission.
{% endhint %}

{% hint style="info" %}
**Note:** The `publicKey` argument is optional, if it is not provided, the extension will use the currently selected wallet's public key. You might only need this if the message to be verified was not made by the connected user.
{% endhint %}

{% hint style="info" %}
**Note:** The `options` argument is optional, if it is not provided, the extension will use the default signature options (default hash algorithm) to sign the data.
{% endhint %}

## Example usage

```ts
// connect to the extension
await window.arweaveWallet.connect(["SIGNATURE"]);

// data to be signed
const data = new TextEncoder().encode("The hash of this msg will be signed.");

// create signature
const signature = await window.arweaveWallet.signMessage(data);

// verify signature
const isValidSignature = await window.arweaveWallet.verifyMessage(data, signature);

console.log(`The signature is ${isValidSignature ? "valid" : "invalid"}`);
```

===== END FILE: api/verify-message.md =====

===== FILE: connect/advanced-customization.md =====
---
description: Advanced customization options for the Wander Connect Embedded Wallet
---

# Advanced Customization

The Wander Connect SDK allows you customize different CSS variables for the 2 different UI components it renders on the screen: the wallet and the button. Additionally, you can also inject your own custom CSS.

## Customize CSS Variables

### Iframe

```javascript
const wander = new WanderConnect({
  iframe: {
    cssVars: {
      background: "#f5f5f5",
      borderRadius: 12,
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
    },
  },
});
```

### Button

```javascript
const wander = new WanderConnect({
  button: {
    position: "top-right",
    cssVars: {
      // Light theme variables
      light: {
        background: "#ffffff",
        color: "#000000",
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      },
      // Dark theme variables
      dark: {
        background: "#1a1a1a",
        color: "#ffffff",
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
      },
    },
  },
});
```

## Inject custom CSS

### Iframe

You can add custom CSS styles to the iframe using `customStyles` option. When using this option, you must use CSS selectors to target specific elements.

Available selectors:

* `.backdrop` - Targets the backdrop overlay behind the iframe
  * `.backdrop.show` - Applied when the backdrop is visible
* `.iframe-wrapper` - Targets the container that wraps the iframe
  * `.iframe-wrapper.show` - Applied when the iframe is visible
* `.iframe` - Targets the actual iframe element
* `.half-image` - Targets the image element used in half layout mode
  * `.half-image.show` - Applied when the half-image is visible

The HTML structure is follows:

```html
<div class="wrapper">
  <iframe class="iframe"></iframe>
</div>
<div class="backdrop"></div>
<div class="half-image"></div>
```

Example usage:

```javascript
const wander = new WanderConnect({
  iframe: {
    customStyles: `
      /* Style the backdrop */
      .backdrop {
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(8px);
        transition: opacity 200ms ease;
      }

      .backdrop.show {
        opacity: 1;
      }

      /* Style the iframe wrapper */
      .iframe-wrapper {
        border: none;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        transition: transform 200ms ease, opacity 200ms ease;
      }

      .iframe-wrapper.show {
        opacity: 1;
        transform: none;
      }

      /* Style the iframe itself */
      .iframe {
        border-radius: inherit;
        background: white;
      }

      /* Style the half-image */
      .half-image {
        object-fit: cover;
        transition: opacity 300ms ease;
      }

      .half-image.show {
        opacity: 1;
      }

      /* Mobile-specific styles */
      @media (max-width: 540px) {
        .backdrop {
          backdrop-filter: none;
        }

        .iframe-wrapper {
          border-radius: 0;
        }
      }
    `,
  },
});
```

The iframe wrapper element (`.iframe-wrapper`) has several data attributes that you can use for conditional styling:

* `[data-layout="popup|modal|sidebar|half"]` - Current layout type
* `[data-position="left|right|top-left|top-right|bottom-left|bottom-right"]` - Position of the iframe
* `[data-expanded="true|false"]` - Whether the iframe is in expanded mode
* `[data-expand-on-mobile="true|false"]` - Whether the iframe expands on mobile devices

You can also use these when targeting the iframe element (`.iframe`):

```css
.iframe-wrapper[data-layout="popup"] > .iframe {
  ...;
}
```

Or the backdrop element (`.backdrop`):

```css
.iframe-wrapper[data-layout="popup"] + .backdrop {
  ...;
}
```

You can use these attributes in your `customStyles` to style different states:

```javascript
customStyles: `
  /* Style popup layout */
  .iframe-wrapper[data-layout="popup"] {
    transform: scale(0.95);
  }

  .iframe-wrapper[data-layout="popup"].show {
    transform: scale(1);
  }

  /* Style expanded sidebar */
  .iframe-wrapper[data-layout="sidebar"][data-expanded="true"] {
    border: none;
    border-radius: 0;
  }

  /* Style right-positioned half layout */
  .iframe-wrapper[data-layout="half"][data-position="right"] {
    border-left: 2px solid rgba(0, 0, 0, 0.1);
  }

  /* Style mobile expanded state */
  .iframe-wrapper[data-expand-on-mobile="true"] {
    width: 100vw;
    height: 100vh;
    border: none;
    border-radius: 0;
  }

  /* Combine attributes for specific cases */
  .iframe-wrapper[data-layout="sidebar"][data-position="right"][data-expanded="true"] {
    box-shadow: -8px 0 32px rgba(0, 0, 0, 0.1);
  }
`;
```

### Button

You can add custom CSS styles to the button using `customStyles` option. When using this option, you must use CSS selectors to target specific elements.

Available selectors:

* `:host` - Targets the button container
* `.button` - Targets the button element
* `.wanderLogo` - Targets the Wander logo SVG
* `.label` - Targets the button text label
* `.balance` - Targets the balance display
* `.indicator` - Targets the connection status indicator
* `.notifications` - Targets the notifications badge

Example usage:

```javascript
const wander = new WanderConnect({
  button: {
    customStyles: `
      /* Position the button container */
      :host {
        position: fixed;
        top: 20px;
        right: 20px;
      }

      /* Target the button element */
      .button {
        width: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Target the Wander logo */
      .wanderLogo {
        width: 24px;
        height: 24px;
      }

      /* Target the button label */
      .label {
        font-size: 14px;
        font-weight: 500;
      }

      /* Target the balance display */
      .balance {
        font-size: 12px;
        opacity: 0.8;
      }

      /* Target the connection indicator */
      .indicator {
        width: 6px;
        height: 6px;
      }

      /* Target the notifications badge */
      .notifications {
        font-size: 10px;
        padding: 2px 6px;
      }
    `,
  },
});
```

The button element has a `data-variant` HTML attribute you can use for styling:

* `[data-variant="loading|onboarding|authenticated|not-authenticated"]`

As well as some CSS classes that are added based on its state:

* `.isConnected` - Added when the wallet is connected
* `.isOpen` - Added when the wallet interface is open

Additionally, the button's `.label` and `.balance` elements also have some modifiers:

* `.label.isLoading`
* `.balance.isLoading`
* `.balance.isHidden`

You can use these classes in your `customStyles` to style different states:

```javascript
customStyles: `
  .button.isAuthenticated {
    border-color: green;
  }

  .button.isConnected {
    background: rgba(0, 255, 0, 0.1);
  }

  .button.isOpen {
    transform: scale(0.95);
  }
`;
```

===== END FILE: connect/advanced-customization.md =====

===== FILE: connect/custom-ui.md =====
---
description: Custom UI for the Wander Connect Embedded Wallet
---

# Custom UI

If the [Advanced Customization Options](advanced-customization.md) provided by the Wander Connect SDK are not\
enough for your, you can instead provide your own `iframe` element (reference) and use the [SDK methods](methods.md) to open/closing the wallet without relaying on the default injected button.

## Providing a custom `iframe`

```javascript
const wander = new WanderConnect({
  iframe: document.getElementById("wander-iframe"),
});
```

## Disabling the default injected `button`

```javascript
const wander = new WanderConnect({
  button: false,
});
```

===== END FILE: connect/custom-ui.md =====

===== FILE: connect/event-callbacks.md =====
---
description: Callbacks available on the Wander Connect SDK
---

# Event Callbacks

## `onAuth(authInfo: AuthInfo)`

Callback function called when authentication state changes.

## `onBackup(backupInfo: BackupInfo)`&#x20;

Callback function called when the user needs or performs backups.

## `onOpen()`&#x20;

Callback function called when the wallet interface is opened.

## `onClose()`&#x20;

Callback function called when the wallet interface is closed.

## `onResize()`&#x20;

Callback function called when the wallet interface is resized.

## `onBalance()`&#x20;

Callback function called when the balance information changes.

## `onRequest()`&#x20;

Callback function called when wallet receives a request.

===== END FILE: connect/event-callbacks.md =====

===== FILE: connect/intro.md =====
---
description: Introducing the Wander Connect Embedded Wallet for Arweave and AO
---

# Intro - Wander Connect

<div data-full-width="false"><figure><img src="../.gitbook/assets/Docs Banner.png" alt=""><figcaption></figcaption></figure></div>

[![Wander Connect SDK NPM package](https://img.shields.io/npm/v/@wanderapp/connect.svg?style=for-the-badge\&color=%23CC3534)](https://www.npmjs.com/package/@wanderapp/connect) [![Wander Connect SDK NPM package license: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge\&color=%230077FF)](https://opensource.org/licenses/MIT)

A simplified, lightweight, customizable embedded wallet for Arweave and AO that bridges the gap between web2 and web3, helping non-crypto native users onboard into web3 easily!

* 🪪 **Familiar Authentication:** Users sign up/in with their favorite and familiar authentication method: email and password, passkeys and social providers (Facebook, Twitter/X, Apple).
* 🔑 **No Seed Phrases:** 5 clicks is all it takes for your users to get to their fully functional wallet. Managing seed phrases and backups is an optional step that can be taken care of later.
* 📱 **Simplified UI:** De-clutter UI with all the functionality your users need, but the same functionality as the mighty Wander Browser Extension.
* ✨ **Refined Experience:** Light and dark themes, and responsive out-of-the-box. A wallet that works on any device and platform, with no download needed.

And offering a great developer experience too:

* 🔌 **Easy Integration**: Easy to use SDK to embed Wander Connect wallet in your dApp.
* 🎨 **Customizable UI**: Extensive customization and layout options. A white-label wallet that can match your brand & site/app's look and feel.
* 🔒 **Secure**: User keys are secured using advanced cryptography, such as AES and Shamir Secret Sharing. Neither we nor your app will ever get access to users' private keys.

## Installation

{% tabs %}
{% tab title="npm" %}
```bash
npm install @wanderapp/connect
```
{% endtab %}

{% tab title="yarn" %}
```bash
yarn add @wanderapp/connect
```
{% endtab %}

{% tab title="pnpm" %}
```bash
pnpm add @wanderapp/connect
```
{% endtab %}

{% tab title="bun" %}
```bash
bun add @wanderapp/connect
```
{% endtab %}
{% endtabs %}

## Basic Usage

To use the Wander Connect embedded wallet, you first need to instante it and listen for the `arweaveWalletLoaded`  event, which signals that the wallet API is ready:

```javascript
import { WanderConnect } from "@wanderapp/connect";

// Initialize Wander Connect:
const wander = new WanderConnect({
  clientId: "FREE_TRIAL",
});

// Wait for the wallet API to be injected and for
// the user to authenticate:
window.addEventListener("arweaveWalletLoaded", async (e) => {
  try {  
    const { permissions = [] } = e.detail || {};
    
    if (permissions.length === 0) {
      // Your app is not connected to the wallet yet, so
      // you first need to call `connect()`:
      await window.arweaveWallet.connect([...]);
    }
    
    // Create Arweave transaction:
    const tx = await arweave.createTransaction({ ... });
  
    // Sign transaction:
    await arweave.transactions.sign(tx);
  
    // TODO: Handle (e.g. post) signed transaction.
  } catch (err) {
    alert(`Error: ${ err.message }`);
  }
});
```

{% hint style="warning" %}
Wander Connect will not require a developer account on launch. You can start using it with `clientId: "FREE_TRIAL"`.

However, we'll soon require developers to sign up for a developer account, where you'll get your own `clientId` and get access new customization options.
{% endhint %}

After this, the default Wander Connect button will appear fixed in the bottom-right corner of the screen:

![](<../.gitbook/assets/Default Wander Connect button.png>)

Clicking it will open a popup where your users can authenticate:

![](<../.gitbook/assets/Screenshot 2025-05-07 at 5.45.14 PM (1).png>)

And, once authenticated, the default wallet UI will appear, again, fixed in the bottom-right corner of the screen:

![](<../.gitbook/assets/Screenshot 2025-05-07 at 5.48.26 PM.png>)

Once the user authenticates, an `arweaveWalletLoaded` event will be dispatched. You can then request permissions using [`connect()`](https://github.com/wanderwallet/wander-docs/blob/main/api/connect.md). This will prompt your users to connect their wallet to your dApp:

![](<../.gitbook/assets/Screenshot 2025-05-07 at 5.49.14 PM (1).png>)

Depending on what type of access the user granted, they'll be prompted again to sign the transaction:

![](<../.gitbook/assets/Screenshot 2025-05-07 at 5.52.25 PM (1).png>)

{% hint style="info" %}
As you can see in the example above, to use Wander Connect in your application, you don't need to integrate or learn how most of the [Wander Injected API](https://docs.wander.app/api/intro) works. Using [`arweave-js`](https://npmjs.com/arweave), you can easily sign a transaction through Wander Connect.

However, note that the [Wander Injected API](https://docs.wander.app/api/intro) is exactly the same for both Wander Connect and the Wander Browser Extension, and can be accessed at `window.arweaveWallet` after instantiating Wander Connect.
{% endhint %}

Additional features and options, only available for Wander Connect (not available for the Wander Browser Extension), are available through the SDK options, methods and callbacks:

<table data-view="cards"><thead><tr><th></th><th data-type="content-ref"></th><th data-hidden data-card-cover data-type="files"></th></tr></thead><tbody><tr><td>Options</td><td><a href="options.md">options.md</a></td><td><a href="../.gitbook/assets/Docs Card - Options.png">Docs Card - Options.png</a></td></tr><tr><td>Event Callbacks</td><td><a href="event-callbacks.md">event-callbacks.md</a></td><td><a href="../.gitbook/assets/Docs Card - Callbacks.png">Docs Card - Callbacks.png</a></td></tr><tr><td>Methods</td><td><a href="methods.md">methods.md</a></td><td><a href="../.gitbook/assets/Docs Card - Methods.png">Docs Card - Methods.png</a></td></tr></tbody></table>

### React

When using React, the example above stays mostly the same. The main change needed is to add a `useEffect` block to run it, and, optionally, a [Ref](https://react.dev/learn/referencing-values-with-refs) to keep a reference to the`WanderConnect` instance you've just created:;

```typescript
import { useRef, useState } from "react";
import { WanderConnect } from "@wanderapp/connect";

export function MyApp() {
  const wanderRef = useRef(null);

  useEffect(() => {
    // Initialize Wander Connect:
    const wander = new WanderConnect({
      clientId: "FREE_TRIAL",
    });
    
    // Keep a reference to the instance:
    wanderRef.current = wander;
    
    const handleWalletLoaded = async (e) => {
      try {  
        const { permissions = [] } = e.detail || {};
        
        if (permissions.length === 0) {
          // Your app is not connected to the wallet yet, so
          // you first need to call `connect()`:
          await window.arweaveWallet.connect([...]);
        }
        
        // Create Arweave transaction:
        const tx = await arweave.createTransaction({ ... });
      
        // Sign transaction:
        await arweave.transactions.sign(tx);
      
        // TODO: Handle (e.g. post) signed transaction.
      } catch (err) {
        alert(`Error: ${ err.message }`);
      }
    }
    
    // Wait for the wallet API to be injected and for
    // the user to authenticate:
    window.addEventListener("arweaveWalletLoaded", handleWalletLoaded);

    // Clean up on unmount:
    return () => {
      wander?.destroy();
      wanderRef.current = null;
      window.removeEventListener("arweaveWalletLoaded", handleWalletLoaded);
    };
  }, []);

  return ...;
}
```

### Next.js

To use Wander Connect on a Next.js site, you would follow the same steps describe above in the React section. However, if you are using the App Router, you need to make sure you load Wander Connect in a client component.

## Customization

Wander Connect supports 4 types of layout plus light and dark themes, which should be enough for most projects. If you need to better match your brand and app look and feel, Wander Connect also includes various advanced customization options, but if that's still not enough, you can always opt-out of the default UI and provide a custom one:

<table data-view="cards"><thead><tr><th></th><th data-type="content-ref"></th></tr></thead><tbody><tr><td>Options</td><td><a href="options.md">options.md</a></td></tr><tr><td>Advanced Customization</td><td><a href="advanced-customization.md">advanced-customization.md</a></td></tr><tr><td>Custom UI</td><td><a href="custom-ui.md">custom-ui.md</a></td></tr></tbody></table>

## Architecture & Security

Wander Connect uses [Shamir Secret Sharing](https://en.wikipedia.org/wiki/Shamir's_secret_sharing) to split users' private keys in 2 shares, one stored in the users' device and one stored in our servers.

In order for users to use one of their private keys, they need to authenticate and prove they have the corresponding (device) share, without actually transferring it to our servers (so that users' private keys never reach our servers).\


Once they do that, the server will send back its share, and the Wander Connect app running in the user's device will reconstruct the private key.

We use [Privy's `shamir-secret-sharing`](https://www.npmjs.com/package/shamir-secret-sharing) package, which has been audited and is actively maintained.

## Browser Support

The SDK supports all modern browsers (Chrome, Firefox, Safari, Edge, etc).

===== END FILE: connect/intro.md =====

===== FILE: connect/methods.md =====
---
description: Methods available on the Wander Connect SDK
---

# Methods

## `open(directAccess?: DirectAccess)`&#x20;

Opens the wallet interface, in a specific flow/page, if specified.

## `close()`&#x20;

Closes the wallet interface.

## `signOut()`&#x20;

Signs out the user.

## `setTheme(theme: ThemeSetting)`&#x20;

Update the app, iframe and button themes.

Note that if `options.iframe.theme` or `options.button.theme` are used, the iframe theme and/or the button theme, respectively, won't be updated. In that case, you should call `setIframeTheme()` and/or `setButtonTheme()`.

## `setIframeTheme(theme: ThemeSetting)`&#x20;

Update the iframe theme (outside only, doesn't affect the iframe content's / app theme).

## `setButtonTheme(theme: ThemeSetting)`&#x20;

Update the button theme.

## `destroy()`&#x20;

Removes all elements and event listeners.

===== END FILE: connect/methods.md =====

===== FILE: connect/options.md =====
---
description: Options for the Wander Connect SDK
---

# Options

The Wander Connect SDK options include:

* SDK setup options.
* Basic customization options.
* Specific customization options for the 2 different UI components it renders on the screen: the iframe and the button.
* Event callbacks.

A more complete example will look something like this:

```javascript
import { WanderEmbedded } from "@wanderapp/embed-sdk";

// Initialize Wander Connect:
const wander = new WanderConnect({
  clientId: "FREE_TRIAL",
  theme: "dark",
  iframe: {
    layout: {
      type: "popup",
      position: "bottom-left",
    }
  },
  button: {
    position: "bottom-left",
    label: true,
  },
  onAuth: () => handleAuth,
});
```

**API**

```typescript
interface IframeOptions {
  clientId: string;
  theme?: ThemeSetting;
  hideBE?: boolean;
  baseURL?: string;
  baseServerURL?: string;
  iframe?: IframeOptions | HTMLIFrameElement;
  button?: ButtonOptions | boolean;
  onAuth?: (authInfo: AuthInfo) => void;
  onBackup?: (backupInfo: BackupInfo) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onResize?: (routeConfig: RouteConfig) => void;
  onBalance?: (balanceInfo: BalanceInfo) => void;
  onRequest?: (requestsInfo: RequestsInfo) => void;

}
```

[Github: wander-connect.types.ts](https://github.com/wanderwallet/Wander/blob/production/wander-connect-sdk/src/wander-connect.types.ts)

## Iframe Customization Options

### Iframe Layout

```javascript
const wander = new WanderConnect({
  iframe: {
    routeLayout: {
      // Different layouts for different routes
      default: {
        type: "popup",
        position: "bottom-right",
      },
      auth: {
        type: "modal",
      },
      "auth-request": {
        type: "sidebar",
        position: "right",
        expanded: true,
      },
    },
    cssVars: {
      background: "#f5f5f5",
      borderRadius: 12,
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
    },
  },
});
```

**API**

```typescript
interface IframeOptions {
  id?: string;
  theme?: ThemeSetting;
  cssVars?: Partial<T> | Partial<Record<ThemeVariant, Partial<T>>>;
  customStyles?: string;
  routeLayout?:
    | LayoutType
    | LayoutConfig
    | Partial<Record<RouteType, LayoutType | LayoutConfig>>;
  clickOutsideBehavior?: boolean;
}
```

[Github: wander-connect.types.ts](https://github.com/wanderwallet/Wander/blob/production/wander-connect-sdk/src/wander-connect.types.ts)

## Button Customization Options

### Button Positioning

You have three methods for custom positioning:

#### Using Predefined Positions

```javascript
const wander = new WanderConnect({
  button: {
    position: "bottom-right", // Options: "bottom-right", "bottom-left", "top-right", "top-left"
  },
});
```

#### Using a Parent Element

First, create a container element:

```html
<div id="wanderButtonContainer"></div>
```

Then reference it in your configuration:

```javascript
const wander = new WanderConnect({
  button: {
    position: "static",
    parent: document.getElementById("wanderButtonContainer"),
  },
});
```

#### Using Custom Styles

```javascript
const wander = new WanderConnect({
  button: {
    position: "static",
    // Using customStyles for precise control over button appearance and position
    customStyles: `
      /* Position the button container */
      :host {
        position: fixed;
        top: 20px;
        right: 20px;
      }

      /* Style the button itself */
      .button {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(8px);
      }
    `,
  },
});
```

#### Using External CSS

Define the button with a custom ID:

```javascript
const wander = new WanderConnect({
  button: {
    position: "static",
    id: "my-wander-button", // Default is "wanderEmbeddedButtonHost"
  },
});
```

Then style it with external CSS:

```css
/* Position the button container */
#my-wander-button {
  position: fixed;
  top: 20px;
  right: 20px;
}
```

**API**

```typescript
interface ButtonOptions {
  id?: string;
  theme?: ThemeSetting;
  cssVars?: Partial<T> | Partial<Record<ThemeVariant, Partial<T>>>;
  customStyles?: string;
  parent?: HTMLElement;
  position?: WanderEmbeddedButtonPosition;
  wanderLogo?: WanderEmbeddedLogoVariant;
  dappLogoSrc?: string; // TODO: Remove?
  label?: boolean;
  balance?: boolean | WanderEmbeddedBalanceOptions;
  notifications?: WanderEmbeddedButtonNotifications;
  i18n?: WanderEmbeddedButtonLabels;
}
```

[Github: wander-connect.types.ts](https://github.com/wanderwallet/Wander/blob/production/wander-connect-sdk/src/wander-connect.types.ts)

===== END FILE: connect/options.md =====

===== FILE: connect/properties.md =====
---
description: Properties for the Wander Connect SDK
---

# Properties

## `authInfo: AuthInfo`&#x20;

Contains the current authentication state of the SDK, and it is initialized with cached data in order to show as soon as possible the non-auth or the loading auth UIs.

## `routeConfig: RouteConfig | null`&#x20;

Current route configuration including dimensions and layout preferences.

## `backupInfo: BackupInfo | null`

User's current backup information.

## `balanceInfo: BalanceInfo | null`&#x20;

User's current balance information.

## `pendingRequests: number`&#x20;

Number of pending requests awaiting user action.

## `isOpen: boolean`

Indicates whether the wallet interface is currently open/visible.

## `width: number | undefined`

Current width of the wallet interface in pixels.

## `height: number | undefined`&#x20;

Current height of the wallet interface in pixels.


===== END FILE: connect/properties.md =====

===== FILE: devtools/arlocal-devtools.md =====
---
description: Custom devtools tab for easier ArLocal testing and operations
---

# ArLocal Devtools

<div data-full-width="false"><figure><img src="../.gitbook/assets/Docs-Arlocal (1).png" alt=""><figcaption></figcaption></figure></div>

The new [`ArLocal`](https://github.com/textury/arlocal) Devtools allow developers to easily interact with their local or public testnet without having to run scripts to perform certain actions. The tool can be accessed by opening the browser's devtools and clicking on the `ArLocal` tab.

## Setup

Upon startup, the tool will ask you to provide some information about the arlocal gateway you want to use. After setting the gateway URL, click the refresh button to load the action sheet.

<div data-full-width="false"><figure><img src="../.gitbook/assets/Docs-Arlocal-Refresh (1).png" alt=""><figcaption></figcaption></figure></div>

## Mint testnet AR

You can mint testnet Arweave tokens that can be used like regular AR. Enter the desired amount in the input under the `Mint AR` title and click _Mint_. The tool will call the testnet to deposit AR into the currently active wallet in Wander and request the testnet to mine a block.

## Create testnet transaction

The ArLocal Devtools allow you to create new transactions with tags, a target and data. Simply set the desired fields under the `Create Transaction` title, enter your password and click _Send Transaction_. The tool will submit the transaction and request the testnet to mine a block.

## Manual block mining

You can manually request the testnet to mine a block by clicking the _Mine_ button, under the _Send Transaction_ button.

===== END FILE: devtools/arlocal-devtools.md =====

===== FILE: devtools/wander-devtools.md =====
---
description: Custom devtools tab for easier Wander testing
---

# Wander Devtools

<div data-full-width="false"><figure><img src="../.gitbook/assets/Docs-Devtools (1).png" alt=""><figcaption></figcaption></figure></div>

The Wander devtools allows you to easily connect your application to Wander and manage its settings.

## Connect

Upon startup, you'll be able to connect your app. You can select what permissions you want to allow the app to have. Once you selected the permissions you want, click _Force Connect_.

## Manage your app

The following settings are available at a glance for your app:

* Permissions\
  Manage permissions for your application quickly.
* Allowance\
  Manage spending allowance for your app
* Gateway\
  Select from suggested gateways or enter a custom one
*   Bundler node\
    Set the bundler node your app uses when calling [`dispatch()`](../api/dispatch.md) .

    Turbo is the default bundler node

===== END FILE: devtools/wander-devtools.md =====

===== FILE: how-to/subsidizing-payments.md =====
---
description: Subsidizing Arweave/AO payments
---

# Subsidizing Arweave/AO payments

You can subsidize payments in Arweave/AO using a bundler.

While it is outside the scope of these docs, you should know you can either run your own bundler, 
or use a commercial option like [ArDrive's Turbo](https://docs.ardrive.io/docs/turbo/what-is-turbo.html).

You can find more about [Turbo Credit Sharing here](https://docs.ardrive.io/docs/turbo/what-is-turbo.html).


===== END FILE: how-to/subsidizing-payments.md =====
