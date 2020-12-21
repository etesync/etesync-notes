const CHECKED_REGEX = /- \[x\]/i;
const UNCHECKED_REGEX = /- \[ \]/;

export default function toggleCheckbox(
  content: string,
  startline: string,
  endline: string,
  setContent: (value: string) => void
): void {
  const sl = parseInt(startline);
  const el = parseInt(endline);

  // Split into lines
  const arr = content.split("\n");
  const parentTask = arr[sl];

  // See if the (first) checkbox in the start line is checked or unchecked
  // to determine the state of all the group
  const checkedIndex = parentTask.search(CHECKED_REGEX);
  const uncheckedIndex = parentTask.search(UNCHECKED_REGEX);
  const checked =
    uncheckedIndex === -1 ||
    (checkedIndex !== -1 && checkedIndex < uncheckedIndex);

  // Get the start and end position of the checkbox range
  const len = content.length;
  let line = 0;
  let pos = 0;
  let startPos = 0;
  let endPos = 0;
  while (pos < len && line < el) {
    const ch = content.charCodeAt(pos);

    if (ch === 0x0a || pos === len - 1) {
      line++;

      if (line === sl) {
        startPos = pos + 1;
      } else if (line === el) {
        endPos = pos;
      }
    }

    pos++;
  }

  // Extract the different parts for the new content
  const before = content.slice(0, startPos);
  const toChange = content.slice(startPos, endPos).split("\n");
  const after = content.slice(endPos);

  // Change the checkbox(es)
  toChange.forEach((s, i, arr) => {
    if (checked) {
      arr[i] = s.replace(CHECKED_REGEX, "- [ ]");
    } else {
      arr[i] = s.replace(UNCHECKED_REGEX, "- [x]");
    }
  });

  setContent(before + toChange.join("\n") + after);
}
