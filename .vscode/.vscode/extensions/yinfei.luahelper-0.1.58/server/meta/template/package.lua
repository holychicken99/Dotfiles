---@class package @The *package* library provides basic facilities for loading modules in Lua. It exports one function directly in the global environment: *require*. Everything else is exported in the table *package*. [`View online doc`](https://www.lua.org/manual/5.4/manual.html#6.3)  |  [`View local doc`](command:extension.lua.doc?["en-us/54/manual.html/6.3"])
package = {}

--- A string describing some compile-time configurations for packages. This
--- string is a sequence of lines:
---
--- The first line is the directory separator string. Default is '\' for Windows
--- and '/' for all other systems.
--- The second line is the character that separates templates in a path. Default
--- is ';'.
--- The third line is the string that marks the substitution points in a
--- template. Default is '?'.
--- The fourth line is a string that, in a path in Windows, is replaced by the
--- executable's directory. Default is '!'.
--- The fifth line is a mark to ignore all text after it when building the
--- luaopen_ function name. Default is '-'.
--[`View online doc`](https://www.lua.org/manual/5.4/manual.html#pdf-package.config)  |  [`View local doc`](command:extension.lua.doc?["en-us/54/manual.html/pdf-package.config"])
package.config = ""

--- The path used by `require` to search for a Lua loader.
---
--- At start-up, Lua initializes this variable with the value of the environment
--- variable `LUA_PATH_5_4` or the environment variable `LUA_PATH` or with a
--- default path defined in `luaconf.h`, if those environment variables are not
--- defined. Any ";;" in the value of the environment variable is replaced by
--- the default path.
--[`View online doc`](https://www.lua.org/manual/5.4/manual.html#pdf-package.path)  |  [`View local doc`](command:extension.lua.doc?["en-us/54/manual.html/pdf-package.path"])
package.path = ""

--- The path used by `require` to search for a C loader.
---
--- Lua initializes the C path `package.cpath` in the same way it initializes
--- the Lua path `package.path`, using the environment variable `LUA_CPATH_5_4`
--- or the environment variable `LUA_CPATH`, or a default path defined in
--- `luaconf.h`.
--[`View online doc`](https://www.lua.org/manual/5.4/manual.html#pdf-package.cpath)  |  [`View local doc`](command:extension.lua.doc?["en-us/54/manual.html/pdf-package.cpath"])
package.cpath = ""


--- A table to store loaders for specific modules (see `require`).
---
--- This variable is only a reference to the real table; assignments to this
--- variable do not change the table used by `require`.
--[`View online doc`](https://www.lua.org/manual/5.4/manual.html#pdf-package.preload)  |  [`View local doc`](command:extension.lua.doc?["en-us/54/manual.html/pdf-package.preload"])
package.preload = {}

---@version lua5.1
--A table used by *require* to control how to load modules.
--
--Each entry in this table is a searcher function. When looking for a module, *require* calls each of these searchers in ascending order, with the module name (the argument given to *require*) as its sole parameter. The function can return another function (the module loader) or a string explaining why it did not find that module (or nil if it has nothing to say). Lua initializes this table with four functions.
package.loaders = {}

--- Dynamically links the host program with the C library `libname`.
---
--- If `funcname` is "*", then it only links with the library, making the
--- symbols exported by the library available to other dynamically linked
--- libraries. Otherwise, it looks for a function `funcname` inside the library
--- and returns this function as a C function. So, `funcname` must follow the
--- `lua_CFunction` prototype (see `lua_CFunction`).
---
--- This is a low-level function. It completely bypasses the package and module
--- system. Unlike `require`, it does not perform any path searching and does
--- not automatically adds extensions. `libname` must be the complete file name
--- of the C library, including if necessary a path and an extension. `funcname`
--- must be the exact name exported by the C library (which may depend on the C
--- compiler and linker used).
---
--- This function is not supported by Standard C. As such, it is only available
--- on some platforms (Windows, Linux, Mac OS X, Solaris, BSD, plus other Unix
--- systems that support the `dlfcn` standard).
---@param libname string
---@param funcname string
---@return fun():nil
--[`View online doc`](https://www.lua.org/manual/5.4/manual.html#pdf-package.loadlib)  |  [`View local doc`](command:extension.lua.doc?["en-us/54/manual.html/pdf-package.loadlib"])
function package.loadlib(libname, funcname) end

--- A table used by require to control how to load modules.
---
--- Each entry in this table is a *searcher function*. When looking for a
--- module, *require* calls each of these searchers in ascending order, with the
--- module name (the argument given to `require`) as its sole parameter. The
--- function can return another function (the module *loader*) plus an extra
--- value that will be passed to that loader, or a string explaining why it did
--- not find that module (or **nil** if it has nothing to say).
---@version >lua5.2
--[`View online doc`](https://www.lua.org/manual/5.4/manual.html#pdf-package.searchers)  |  [`View local doc`](command:extension.lua.doc?["en-us/54/manual.html/pdf-package.searchers"])
package.searchers = {}

--- Searches for the given name in the given path.
---
--- A path is a string containing a sequence of *templates* separated by
--- semicolons. For each template, the function replaces each interrogation mark
--- (if any) in the template with a copy of name wherein all occurrences of
--- `sep` (a dot, by default) were replaced by `rep` (the system's directory
--- separator, by default), and then tries to open the resulting file name.
---
--- For instance, if the path is the string
--- > "`./?.lua;./?.lc;/usr/local/?/init.lua`"
--- the search for the name `foo.a` will try to open the files `./foo/a.lua`,
--- `./foo/a.lc`, and `/usr/local/foo/a/init.lua`, in that order.
---
--- Returns the resulting name of the first file that it can open in read mode
--- (after closing the file), or **nil** plus an error message if none succeeds.
--- (This error message lists all file names it tried to open.)
---@param name string
---@param path string
---@param sep? string
---@param rep? string
---@return string? filename
---@return string? errmsg
function package.searchpath(name, path, sep, rep) end


--- A table used by `require` to control which modules are already
--- loaded. When you require a module `modname` and `package.loaded[modname]`
--- is not false, `require` simply returns the value stored there.
---
--- This variable is only a reference to the real table; assignments to this
--- variable do not change the table used by `require`.
package.loaded = {}