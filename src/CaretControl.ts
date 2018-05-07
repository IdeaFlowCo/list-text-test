export function getCaretOffsetInside(this: void, rootNode: Node) {
  const range = window.getSelection().getRangeAt(0)
  let node: Node | null = range.endContainer

  let caretOffset = node.hasChildNodes()
    ? nodesContentLength(Array.from(node.childNodes).slice(0, range.endOffset))
    : range.endOffset

  if (!rootNode.contains(node)) {
    throw new Error("Caret is not inside of the specified rootNode")
  }

  console.log({ node, caretOffset })
  
  while (node !== rootNode && node !== null && node.parentNode !== null) {
    const siblingNodes: Node[] = Array.from(node.parentNode.childNodes)
    const index = siblingNodes.indexOf(node)

    console.log({
      node,
      index,
      siblingNodes,
    })

    caretOffset += nodesContentLength(siblingNodes.slice(0, index))
    node = node.parentNode
  }

  return caretOffset
}

// TODO: This is potentially expensive
function nodesContentLength(nodes: Node[]) {
  const div = document.createElement("div")
  for(const node of nodes) {
    div.appendChild(node.cloneNode(true))
  }
  return nodeContentLength(div)
}

function nodeContentLength(node: Node) {
  return ((node as any).innerText || node.textContent || "").length
}