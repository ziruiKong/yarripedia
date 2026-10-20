import { Fragment, type ReactNode } from "react";

type RichTextProps = {
  text: string;
  renderPlain?: (text: string) => ReactNode;
};

/** Render the small Markdown subset used by Yarripedia's article editor. */
export default function RichText({ text, renderPlain }: RichTextProps) {
  const tokens = text.split(/(\*\*[^*]+\*\*|__[^_]+__|<u>.*?<\/u>|\*[^*]+\*)/g);
  const plain = (value: string) => renderPlain ? renderPlain(value) : value;

  return <>{tokens.map((token, index) => {
    if (!token) return null;
    if (token.startsWith("**") && token.endsWith("**")) return <strong key={index}>{plain(token.slice(2, -2))}</strong>;
    if (token.startsWith("__") && token.endsWith("__")) return <u key={index}>{plain(token.slice(2, -2))}</u>;
    if (token.startsWith("<u>") && token.endsWith("</u>")) return <u key={index}>{plain(token.slice(3, -4))}</u>;
    if (token.startsWith("*") && token.endsWith("*")) return <em key={index}>{plain(token.slice(1, -1))}</em>;
    return <Fragment key={index}>{plain(token)}</Fragment>;
  })}</>;
}
