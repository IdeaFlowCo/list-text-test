import * as React from 'react'

import { withStateSelector } from './AppState'

// class Item extends React.Component<any> {
//   render() {
//     return `Hello ${this.props.idea}`
//   }
// }

export default withStateSelector(
  class List extends React.Component<any> {
    render() {
      return <>
        There are {this.props.ideas.length} ideas!
        {/* {this.props.ideas.map((idea, i) => {
          <Item key={i} idea={idea} />
        })} */}
        <button onClick={() => this.props.addNewIdea("New idea")}>thing</button>
      </>
    }
  },
  (appState) => ({ ideas: appState.ideas }),
  (dispatch) => ({
    addNewIdea: (idea: string) => dispatch(appState => ({
      ...appState, ideas: [...appState.ideas, idea]
    }))
  })
)