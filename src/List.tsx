import * as React from 'react'
import he from 'he'

import { withStateSelector } from './AppState'

import styles from './List.styl'

import { getCaretOffsetInside } from './CaretControl'

import { CreateListActions } from './ListActions'

interface ItemProps {
  index: number
  idea: { id: string, title: string }
  caretExit: any
  onSplit: any

  mergeIdeasInRange: any
}

class Item extends React.Component<ItemProps> {
  private ref: React.RefObject<HTMLDivElement> = React.createRef()

  render() {
    const content = this.props.idea.title
    return <div
      ref={this.ref}
      className={styles.listItem}
      contentEditable
      dangerouslySetInnerHTML={{ __html: he.encode(content) + "\n\n" }}

      onKeyDown={this.onKeyDown}
    />
  }

  private getValue() {
    return this.ref.current !== null
      ? this.ref.current.innerText.replace(/\n\n$/, "")
      : ""
  }

  private getTextAroundTheCaret(before: number, after: number) {
    if (this.ref.current === null) {
      throw new Error("Component has not yet rendered")
    }

    const offset = getCaretOffsetInside(this.ref.current)
    return {
      offset,
      text: this.getValue().slice(offset - before, offset + after),
      before: this.getValue().slice(0, offset - before),
      after: this.getValue().slice(offset + after),
    }
  }

  onKeyDown = (event: React.KeyboardEvent<any>) => {
    const { key } = event
    if (key === "Enter") {
      this.onEnter(event)
    } else if (key === "Backspace") {
      this.onBackspace(event)
    }

    const range = window.getSelection().getRangeAt(0)
    const { before, after } = this.getTextAroundTheCaret(0, 0)
    console.log({ before, after })

    if (!range || !range.collapsed) return

    if (key === "ArrowUp" && before === "") {
      this.props.caretExit(this.props.index, -1)
      event.preventDefault()
    } else if (key === "ArrowDown" && after.match(/^\n?$/)) {
      this.props.caretExit(this.props.index, +1)
      event.preventDefault()
    }
  }

  onBackspace = (event: React.KeyboardEvent<any>) => {
    if (this.ref.current === null) {
      throw new Error("Component has not yet rendered")
    }

    const offset = getCaretOffsetInside(this.ref.current)

    if (offset === 0) {
      this.props.mergeIdeasInRange(this.props.index-1, this.props.index)
      event.preventDefault()
    }
  }

  onEnter = (event: React.KeyboardEvent<any>) => {
    const { text, offset } = this.getTextAroundTheCaret(+1, +1)

    const match = text.match(/\n/)
    if (match) {
      console.log("splitting", this.props.index, offset)
      this.props.onSplit(this.props.index, offset)
      event.preventDefault()
    }
  }

  focusEnd = () => {
    if (!this.ref.current) return

    this.ref.current.focus()
    const selection = window.getSelection()

    const nodeCount = this.ref.current.childNodes.length
    const node = this.ref.current.childNodes[nodeCount-1]

    const range = document.createRange()
    range.setStart(node, (node.textContent || "").length)
    range.setEnd(node, (node.textContent || "").length)

    selection.removeAllRanges()
    selection.addRange(range)
  }
}

class List extends React.Component<any> {
  private itemInstances: (Item | null)[] = []
  
  render() {
    return <>
      {this.props.ideas.map((idea, i) => {
        return <Item
          ref={(item) => this.itemInstances[i] = item}
          key={idea.id}
          index={i}
          idea={idea}
          caretExit={this.caretExit}
          onSplit={this.props.onSplit}
          mergeIdeasInRange={this.props.mergeIdeasInRange}
        />
      })}
    </>
  }

  private caretExit = (itemIndex: number, direction: 1 | -1) => {
    const instance = this.itemInstances[itemIndex + direction]
    if (instance) { 
      instance.focusEnd()
    }
  }
}

export default withStateSelector(
  List,
  (appState) => ({ ideas: appState.ideas }),
  CreateListActions,
)