import * as React from 'react'
import he from 'he'

import { withStateSelector } from './AppState'

import styles from './List.styl'

class Item extends React.Component<any> {
  render() {
    return <div 
      className={styles.listItem}
      contentEditable
      dangerouslySetInnerHTML={{ __html: he.encode(this.props.idea) }}
    />
  }
}

class List extends React.Component<any> {
  render() {
    return <>
      {this.props.ideas.map((idea, i) => {
        return <Item key={i} idea={idea} />
      })}
      <button onClick={() => this.props.addNewIdea("New idea")}>Add new idea</button>
    </>
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