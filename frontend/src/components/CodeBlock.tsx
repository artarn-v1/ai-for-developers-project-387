import { CodeHighlight } from '@mantine/code-highlight'

interface CodeBlockProps {
  code: string | object
}

export function CodeBlock({ code }: CodeBlockProps) {
  const json = typeof code === 'string' ? code : JSON.stringify(code, null, 2)
  return <CodeHighlight code={json} language="json" />
}
