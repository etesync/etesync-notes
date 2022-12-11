import * as Etebase from "etebase";
import YAML from "js-yaml";
import JSZip from "jszip";

export async function getItemData(item: Etebase.Item, format = "") {
  const data = {
    name: item.getMeta().name,
    content: "",
  };
  const content = await item.getContent(Etebase.OutputFormat.String);

  switch (format) {
    case "export": {
      const frontmatter = YAML.dump({ title: data.name });
      data.content = `---\n${frontmatter}---\n\n${content}`;
      break;
    }
    default: {
      data.content = `# ${data.name}\n\n${content}`;
    }
  }
  return data;
}

export async function getItemsZip<T extends JSZip.OutputType>(items: Etebase.Item[], format: T) {
  const zip = new JSZip();

  for (const item of items) {
    const itemData = await getItemData(item, "export");
    zip.file(`${itemData.name?.replace(/[/\\]/g, "-")}.md`, itemData.content);
  }
  return zip.generateAsync<T>({ type: format });
}