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
      dangerouslySetInnerHTML={{ __html: he.encode(this.props.idea) }}

      onKeyDown={this.onKeyDown}
    />
  }

  onKeyDown = (event: React.KeyboardEvent<any>) => {
    const { key } = event
    const range = window.getSelection().getRangeAt(0)
    if (!range) return

    if (key === "ArrowUp" && range.startOffset === 0 && range.collapsed) {
      this.props.caretExit(this.props.index, -1)
      event.preventDefault()
    } else if (key === "ArrowDown" && range.startOffset === this.props.idea.length && range.collapsed) {
      this.props.caretExit(this.props.index, +1)
      event.preventDefault()
    }
  }

  focusEnd = () => {
    this.ref.current.focus()
    const selection = window.getSelection()

    const node = this.ref.current.childNodes[0]

    const range = document.createRange()
    range.setStart(node, this.props.idea.length)
    range.setEnd(node, this.props.idea.length)

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