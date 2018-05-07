import * as React from 'react'
import he from 'he'

import { withStateSelector } from './AppState'

import styles from './List.styl'

import { getCaretOffsetInside } from './CaretControl'

class Item extends React.Component<any, any> {
  private ref: React.RefObject<HTMLDivElement> = React.createRef()

  render() {
    const content = this.props.idea
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

  onEnter = (event: React.KeyboardEvent<any>) => {
    console.log("ENTER")
    const { text, offset } = this.getTextAroundTheCaret(+1, +1)
    console.log({ text, offset })

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
          key={i}
          index={i}
          idea={idea}
          caretExit={this.caretExit}
          onSplit={this.onSplit}
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

  private onSplit = (itemIndex: number, offset: number) => {
    this.props.split(itemIndex, offset)
  }
}

export default withStateSelector(
  List,
  (appState) => ({ ideas: appState.ideas }),
  (dispatch) => ({
    addNewIdea: (idea: string) => dispatch(appState => ({
      ideas: [...appState.ideas, idea]
    })),
    split: (itemIndex, offset) => dispatch(appState => {
      const { ideas } = appState
      const ideaToSplit = ideas[itemIndex]
      const newIdea1 = ideaToSplit.slice(0, offset)
      const newIdea2 = ideaToSplit.slice(offset)
      return {
        ideas: [...ideas.slice(0,itemIndex), newIdea1, newIdea2, ...ideas.slice(itemIndex+1)]
      }
    })

  })
)