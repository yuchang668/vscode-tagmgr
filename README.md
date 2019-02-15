# Tagmgr
Provide Intellisense for C/C++ using [GNU Global](https://www.gnu.org/software/global/).

## Usage
* This extension requires GNU Global (>=6.5). You can download the binary from [Global website](https://www.gnu.org/software/global/download.html).

    For Ubuntu 18.04 (and after) user, you can install it via apt:
    ```
    sudo apt install global
    ```

* Add the folder of global executable to PATH enviroment variable, or specify tagmgr.path.gtags and tagmgr.path.global configuration.

* Specify the output encoding of the command line if you're using non-UTF8 Windows.

    Ex: Big5 for Traditional Chinese on Windows
    ```
    {
        "tagmgr.encode.term": "Big5"
    }
    ```

## Command
* `Tagmgr: Build tags`
    * Generate tag files for global by running 'gtags'.

* `Tagmgr: Update tags`
    * Update tags.

## Configuration
* `tagmgr.encode.term`
    * Specify the encoding of the command line output.

* `tagmgr.path.gtags`
    * Specify the path to the gtags. Default is 'gtags'.

* `tagmgr.path.global`
    * Specify the path to the global. Default is 'global'.

## Limitations

GNU global doesn't do any AST parsing, so the auto completion doesn't understand class members and etc.

## Resources
GNU Global: https://www.gnu.org/software/global/

Repository: https://github.com/yuchang668/vscode-tagmgr

**Enjoy!**
