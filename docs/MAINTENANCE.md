# Maintenance Scheduler (25-minute checkpoints)

This repository includes a small helper script to create safe, non-destructive checkpoint commits at regular intervals. Use this only if you want automated, timestamped checkpoints recorded in git history.

## Files
- `tools/create_empty_checkpoint.sh` — Creates an empty commit with a timestamped message.

## Safe usage
1. The script creates an *empty* commit (no file changes). It will NOT modify project files.
2. Run manually to test before scheduling.

### Manual run
```bash
# from repository root
./tools/create_empty_checkpoint.sh
# or with a custom message
./tools/create_empty_checkpoint.sh "chore(maint): checkpoint - minor docs added"
```

### Schedule with cron (simple)
Open your crontab with `crontab -e` and add:

```
# Run every 25 minutes
*/25 * * * * cd /path/to/repo && ./tools/create_empty_checkpoint.sh "chore(maint): automated checkpoint $(date -u +'%Y-%m-%d %H:%M:%SZ')" >/dev/null 2>&1
```

Replace `/path/to/repo` with your repository absolute path.

### macOS Launchd (recommended for macOS users)
Create a plist file at `~/Library/LaunchAgents/com.traveloop.maint.plist` with the following content, then `launchctl load ~/Library/LaunchAgents/com.traveloop.maint.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>com.traveloop.maint</string>
    <key>ProgramArguments</key>
    <array>
      <string>/bin/bash</string>
      <string>/absolute/path/to/repo/tools/create_empty_checkpoint.sh</string>
    </array>
    <key>StartInterval</key>
    <integer>1500</integer> <!-- 1500 seconds = 25 minutes -->
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/traveloop_maint.out</string>
    <key>StandardErrorPath</key>
    <string>/tmp/traveloop_maint.err</string>
  </dict>
</plist>
```

Note: Replace `/absolute/path/to/repo` with your repository root. `StartInterval` accepts seconds.

## Recommendations
- Prefer manual or review-based maintenance commits for meaningful changes.
- Use this automated checkpoint only when you need regular, timestamped history entries.
- Avoid scheduling on branches that are shared or protected without team agreement.

## Removing the scheduler
- Cron: remove the crontab line
- Launchd: `launchctl unload ~/Library/LaunchAgents/com.traveloop.maint.plist` and delete the plist

