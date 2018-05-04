import * as React from 'react'
import he from 'he'

import { withStateSelector } from './AppState'

import styles from './List.styl'

class Item extends React.Component<any> {
  private ref: React.RefObject<HTMLDivElement> = React.createRef()

  render() {
    return <div
      ref={this.ref}
      className={styles.listItem}
      contentEditable
      dangerouslySetInnerHTML={{ __html: he.encode(this.props.idea) + "\n\n" }}

      onKeyDown={this.onKeyDown}
    />
  }

  onKeyDown = (event: React.KeyboardEvent<any>) => {
    const { key } = event
    const range = window.getSelection().getRangeAt(0)
    const node = range.startContainer
    const textAfterCaret = node.textContent.slice(range.startOffset)

    if (!range) return

    if (key === "ArrowUp" && range.startOffset === 0 && range.collapsed) {
      this.props.caretExit(this.props.index, -1)
      event.preventDefault()
    } else if (key === "ArrowDown" && textAfterCaret.match(/^\n?$/) && range.collapsed) {
      this.props.caretExit(this.props.index, +1)
      event.preventDefault()
    }
  }

  focusEnd = () => {
    this.ref.current.focus()
    const selection = window.getSelection()

    const nodeCount = this.ref.current.childNodes.length
    const node = this.ref.current.childNodes[nodeCount-1]

    const range = document.createRange()
    range.setStart(node, node.textContent.length)
    range.setEnd(node, node.textContent.length)

    selection.removeAllRanges()
    selection.addRange(range)
  }
}

class List extends React.Component<any> {
  private itemInstances: Item[] = []
  
  render() {
    return <>
      {this.props.ideas.map((idea, i) => {
        return <Item
          ref={(item) => this.itemInstances[i] = item}
          key={i}
          index={i}
          idea={idea}
          caretExit={this.caretExit} />
      })}
      <button onClick={() => this.props.addNewIdea("New idea")}>Add new idea</button>
    </>
  }

  caretExit = (itemIndex: number, direction: 1 | -1) => {
    const instance = this.itemInstances[itemIndex + direction]
    if (instance) { 
      instance.focusEnd()
    }
  }
}

export default withStateSelector(
  List,
  (appState) => ({ ideas: appState.ideas }),
  (dispatch) => ({
    addNewIdea: (idea: string) => dispatch(appState => ({
      ...appState, ideas: [...appState.ideas, idea]
    }))
  })
)