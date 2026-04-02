@echo off
rem claude.bat - Windows wrapper for Claude Code CLI

rem Run the Node.js wrapper script
node "%~dp0claude.js" %*

rem Exit with the same exit code
exit /b %ERRORLEVEL%
