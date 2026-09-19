# ILOVEYOU

**Type:** Worm (VBScript)
**Also known as:** Love Letter, Love Bug
**First seen:** May 4, 2000
**Origin:** Philippines

## Overview

ILOVEYOU is a VBScript worm that spread over email in May 2000, disguised as a love letter. It arrived as an attachment named `LOVE-LETTER-FOR-YOU.TXT.vbs` — the real `.vbs` extension was hidden because Windows hid known file extensions by default, so it looked like a harmless text file.

## Infection chain

1. **Lure** — an email with the subject `ILOVEYOU` and the body "kindly check the attached LOVELETTER coming from me."
2. **Execution** — once the attachment was opened, the VBScript ran with no exploit needed; it relied entirely on the user double-clicking it.
3. **Persistence** — it copied itself to the Windows and System directories as `MSKernel32.vbs`, `Win32DLL.vbs`, and `LOVE-LETTER-FOR-YOU.TXT.vbs`, and added registry run keys so it survived reboot.
4. **File damage** — it searched local and network drives for files with certain extensions (`.jpg`, `.jpeg`, `.vbs`, `.js`, `.css`, `.mp3`, `.mp2`, and others) and overwrote them with copies of itself, in most cases destroying the original content permanently.
5. **Propagation** — it used Microsoft Outlook's address book (MAPI) to email a copy of itself to every contact, which is what made it spread so fast.
6. **Secondary payload** — it also dropped a password-stealing trojan (`WIN-BUGSFIX.exe`), downloaded from a remote server, tied to the Barok/LOVELETTER malware family.

## Impact

Estimated to have infected over 45 million Windows machines within days and caused billions of dollars in damage worldwide, making it one of the most damaging malware outbreaks in history at the time.

## Why it worked

No sophisticated exploit was involved. It succeeded through social engineering — a trusted-looking subject line, a hidden file extension, and the built-in trust of email coming from someone already in the victim's contact list.
