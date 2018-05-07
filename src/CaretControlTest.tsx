import * as React from 'react'

import { getCaretOffsetInside } from './CaretControl'

export default class CaretControlTest extends React.Component<any> {
  private ref = React.createRef<HTMLDivElement>()

  render() {
    const text1 = "ABC"
    const text2 = "DEF"

    return <div ref={this.ref} contentEditable suppressContentEditableWarning>
      <span>{text1}</span>
      <br /><br />
      <span>{text2}</span>
    </div>
  }

  componentDidMount() {
    document.addEventListener("selectionchange", this.onSelectionChange)
  }

  componentWillUnmount() {
    document.removeEventListener("selectionchange", this.onSelectionChange)
  }

  private onSelectionChange = () => {
    if (this.ref.current === null) throw new Error("A")

    const offset = getCaretOffsetInside(this.ref.current)
    const text = this.ref.current.innerText
    console.log({
      offset,
      before: JSON.stringify(text.slice(0,offset)),
      after: JSON.stringify(text.slice(offset)),
    })
  }
}