---
path: src/core/cache.ts
chunkCount: 1
entities:
  - CacheStore
dependenciesPreview:
  - "import fs from 'node:fs';"
  - "import path from 'node:path';"
  - "import crypto from 'node:crypto';"
version: 1
generated_at: "2025-10-26T03:11:37.197Z"
---
# CacheStore

The `CacheStore` class provides a file-based caching mechanism for serialized data, storing it as JSON files within a `.dokify/cache` directory. This allows for efficient storage and retrieval of data that might be computationally expensive to generate.

## Purpose

The primary goal of `CacheStore` is to offer a robust and convenient way to cache data on the filesystem. It handles the complexities of:

*   **Cache Key Generation:** Creating consistent and unique keys from arbitrary input data using SHA256 hashing.
*   **File Storage:** Serializing data into JSON format and writing it to the cache directory.
*   **File Retrieval:** Reading JSON data from the cache directory and deserializing it.
*   **Error Handling:** Gracefully handling potential file system errors during read and write operations, preventing application crashes.

## Key APIs and Functions

### `constructor(rootDir: string)`

*   **Purpose:** Initializes a new instance of `CacheStore`.
*   **Inputs:**
    *   `rootDir`: The root directory of the project. The cache directory will be created as a subdirectory `.dokify/cache` within this `rootDir`.
*   **Behavior:**
    *   Sets up the internal cache directory path.
    *   Attempts to create the cache directory if it doesn't already exist. This operation is performed synchronously and any errors during directory creation are silently ignored.

### `keyFor(input: unknown): string`

*   **Purpose:** Generates a consistent, SHA256-hashed cache key from any JavaScript value.
*   **Inputs:**
    *   `input`: The data (of any type `unknown`) from which to generate the cache key.
*   **Outputs:**
    *   A `string` representing the first 32 characters of the SHA256 hash of the JSON-stringified input.
*   **Behavior:**
    *   Serializes the `input` into a JSON string.
    *   Computes the SHA256 hash of this JSON string.
    *   Returns the hexadecimal representation of the hash, truncated to its first 32 characters.

### `read<T>(key: string): T | null`

*   **Purpose:** Reads a cached value from the store using its key.
*   **Inputs:**
    *   `key`: The cache key (string) of the value to retrieve.
*   **Outputs:**
    *   The deserialized cached value of type `T` if found and successfully parsed.
    *   `null` if the cache file does not exist, or if an error occurs during reading or parsing.
*   **Behavior:**
    *   Constructs the full file path for the cache entry using the provided `key` and appending `.json`.
    *   Checks if the cache file exists. If not, returns `null`.
    *   Reads the content of the cache file as a UTF-8 string.
    *   Parses the JSON string into a JavaScript object.
    *   Returns the parsed object, asserted to be of type `T`.
    *   Catches any file system or JSON parsing errors and returns `null` to indicate failure.

### `write<T>(key: string, value: T): void`

*   **Purpose:** Writes a value to the cache store using its key.
*   **Inputs:**
    *   `key`: The cache key (string) under which to store the `value`.
    *   `value`: The data (of type `T`) to be cached.
*   **Behavior:**
    *   Constructs the full file path for the cache entry using the provided `key` and appending `.json`.
    *   Serializes the `value` into a JSON string with an indentation of 2 spaces for readability.
    *   Writes the JSON string to the cache file using UTF-8 encoding.
    *   Catches any file system errors and silently ignores them.

## Invariants

*   All cache files are stored in the `.dokify/cache` directory relative to the `rootDir` provided during initialization.
*   Cache file names are derived from the generated cache `key` and always end with the `.json` extension.
*   The `keyFor` method will always produce the same `key` for the same `input`, regardless of when it is called.

## Error Handling

`CacheStore` employs a strategy of graceful error handling, primarily by catching exceptions during file system operations and JSON parsing.

*   **`constructor`**: Errors during `fs.mkdirSync` are ignored.
*   **`read`**: If the cache file is not found, or if there's an error reading or parsing the file (e.g., invalid JSON), the method returns `null` instead of throwing an error.
*   **`write`**: Errors during `fs.writeFileSync` are silently ignored.

This approach ensures that the caching mechanism does not disrupt the application's execution flow when cache operations fail.

## Dependencies

The `CacheStore` class relies on the following Node.js built-in modules:

*   `node:fs`: For file system operations like creating directories, reading, and writing files.
*   `node:path`: For path manipulation, specifically joining directory and file names.
*   `node:crypto`: For generating cryptographic hashes (SHA256) to create cache keys.

## Examples

```typescript
import { CacheStore } from './cache';
import path from 'node:path';

// Assuming the current working directory is the project root
const rootDir = process.cwd();
const cacheStore = new CacheStore(rootDir);

// Example 1: Caching a simple string
const key1 = cacheStore.keyFor('my-data-to-cache');
const cachedString = cacheStore.read<string>(key1);

if (cachedString === null) {
    console.log('String not found in cache, generating...');
    const newData = 'This is the cached data!';
    cacheStore.write(key1, newData);
    console.log('String cached successfully.');
} else {
    console.log('String retrieved from cache:', cachedString);
}

// Example 2: Caching a complex object
interface User {
    id: number;
    name: string;
    isActive: boolean;
}

const userData: User = { id: 123, name: 'Alice', isActive: true };
const key2 = cacheStore.keyFor(userData);
const cachedUser = cacheStore.read<User>(key2);

if (cachedUser === null) {
    console.log('User data not found in cache, generating...');
    cacheStore.write(key2, userData);
    console.log('User data cached successfully.');
} else {
    console.log('User data retrieved from cache:', cachedUser);
}

// Example 3: Reading a non-existent key
const nonExistentKey = 'some-random-key-that-does-not-exist';
const notFound = cacheStore.read<any>(nonExistentKey);
console.log(`Reading non-existent key "${nonExistentKey}" returns:`, notFound); // Output: null
```

## Pitfalls

*   **Serialization Limitations:** `JSON.stringify` has limitations. It cannot serialize functions, `undefined` values (they will be omitted), or circular references. If your data contains these, `keyFor` might produce unexpected keys, or `read`/`write` might fail silently.
*   **Case Sensitivity of Keys:** While the generated keys are hashes, the underlying file system operations for reading and writing might be case-sensitive depending on the operating system. Ensure consistency in how keys are generated and used.
*   **Silent Error Ignoring:** The silent ignoring of write errors might mask issues if the cache directory becomes inaccessible or if there are disk full problems. For critical applications, consider adding logging around `write` operations if more robust error reporting is needed.
*   **Cache Invalidation:** This `CacheStore` does not provide any built-in mechanism for cache invalidation (e.g., Time To Live or explicit deletion of specific keys). Cache entries will persist until manually removed or the cache directory is deleted.

## Related Files

This file is likely part of a larger caching or data management system. Depending on the project structure, related files might include:

*   Files that *use* `CacheStore` to read and write data.
*   Configuration files that might define the `rootDir` or other caching parameters.
*   Utilities for cache management (e.g., clearing the cache).

---
Generated: 2025-10-26T03:11:43.284Z  •  Version: v1
