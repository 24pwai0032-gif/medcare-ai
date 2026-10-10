import { Fragment } from 'react';
import { inlineText, isMostlyArabic, type Block, type Inline, type ReportSection } from './parseReport';

/** Urdu sentences inside the English report still get the Urdu font and direction. */
function scriptProps(content: Inline[]) {
  return isMostlyArabic(inlineText(content)) ? ({ lang: 'ur', dir: 'rtl' } as const) : ({ dir: 'auto' } as const);
}

function InlineText({ content }: { content: Inline[] }) {
  return (
    <>
      {content.map((part, i) => (
        <Fragment key={i}>{part.bold ? <strong className="font-semibold">{part.text}</strong> : part.text}</Fragment>
      ))}
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  if (block.kind === 'paragraph') {
    return (
      <p className="leading-relaxed" {...scriptProps(block.content)}>
        <InlineText content={block.content} />
      </p>
    );
  }
  if (block.kind === 'list') {
    const ListTag = block.ordered ? 'ol' : 'ul';
    return (
      <ListTag className={block.ordered ? 'list-decimal space-y-1.5 ps-6' : 'list-disc space-y-1.5 ps-6'}>
        {block.items.map((item, i) => (
          <li key={i} className="leading-relaxed" {...scriptProps(item)}>
            <InlineText content={item} />
          </li>
        ))}
      </ListTag>
    );
  }
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full min-w-max border-collapse text-sm">
        <thead className="bg-muted">
          <tr>
            {block.header.map((cell, i) => (
              <th key={i} scope="col" className="border-b px-3 py-2 text-start font-semibold">
                <InlineText content={cell} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, r) => (
            <tr key={r} className="border-b last:border-b-0">
              {row.map((cell, c) => (
                <td key={c} className="px-3 py-2 align-top tabular-nums">
                  <InlineText content={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ReportBody({ sections }: { sections: ReportSection[] }) {
  return (
    <div className="space-y-6">
      {sections.map((section, i) => (
        <section key={i} className="space-y-3">
          {section.title ? (
            <h2 className="text-sm font-semibold tracking-wide text-primary uppercase">{section.title}</h2>
          ) : null}
          {section.blocks.map((block, b) => (
            <BlockView key={b} block={block} />
          ))}
        </section>
      ))}
    </div>
  );
}
