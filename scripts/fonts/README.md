# Fonts for cover images

These files are used only by `scripts/make-covers.js` — they are not served by
the site and never reach `_site`. They are vendored so a cover renders the same
way on any machine, offline and regardless of the system font set.

| File | Family | Weight | Source |
| --- | --- | --- | --- |
| `Inter-Regular.ttf` | Inter | 400 | Google Fonts (Inter v20) |
| `Inter-Bold.ttf` | Inter | 700 | Google Fonts (Inter v20) |
| `Inter-ExtraBold.ttf` | Inter | 800 | Google Fonts (Inter v20) |
| `NotoSansHebrew-Regular.ttf` | Noto Sans Hebrew | 400 | Google Fonts |
| `NotoSansHebrew-Bold.ttf` | Noto Sans Hebrew | 700 | Google Fonts |

Both families are licensed under the SIL Open Font License 1.1, which allows
bundling and redistribution provided the license travels with the fonts:

- Inter — <https://github.com/rsms/inter/blob/master/LICENSE.txt>
- Noto Sans Hebrew — <https://github.com/notofonts/hebrew/blob/main/LICENSE>

Inter covers Latin and Cyrillic; Hebrew titles fall back to Noto Sans Hebrew
(`scripts/make-covers.js` picks the family by language).
