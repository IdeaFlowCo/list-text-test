import * as React from 'react'
import * as ReactDOM from 'react-dom'

import styles from './index.styl'

const { Consumer: AppStateConsumer, Provider: AppStateProvider } = React.createContext({ ideas: [] })

class ComplexComponent extends React.Component<{ ideas: string[] }> {
  render() {
    return <>
      There are {this.props.ideas.length} ideas!
    </>
  }
}

ReactDOM.render(
  <AppStateProvider value={{ ideas: ["a", "b"] }}>
    <div className={styles.mainBox} style={{ fontSize: 12 }}>Hello</div>
    <div className={styles.mainBox} style={{ fontSize: 16 }}>
      Hello:&nbsp;
      <AppStateConsumer>
        {(value) => <ComplexComponent ideas={value.ideas} />}
      </AppStateConsumer>
    </div>
  </AppStateProvider>,
  document.querySelector("#reactAppMountPoint")
)