@echo off
rem claude.bat - Windows wrapper for Claude Code CLI

rem Get the directory where this batch file is located
set "BAT_DIR=%~dp0"
rem Remove trailing backslash if present
if "%BAT_DIR:~-1%"=="\" set "BAT_DIR=%BAT_DIR:~0,-1%"

rem Change to parent directory (project root)
cd /d "%BAT_DIR%\.."

rem Check if force recovery CLI is requested
if "%CLAUDE_CODE_FORCE_RECOVERY_CLI%"=="1" (
    bun --env-file=.env ./src/localRecoveryCli.ts %*
) else (
    bun --env-file=.env ./src/entrypoints/cli.tsx %*
)

rem Exit with the same exit code as the bun command
exit /b %ERRORLEVEL%
