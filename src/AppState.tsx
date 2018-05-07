import * as React from 'react'

import uuid from 'uuid'

const {
  Consumer: AppStateConsumer,
  Provider: AppStateProvider
} = React.createContext<{ appState: any, dispatch }>()

export { AppStateProvider }

function CreateDummyIdea(title: string) {
  return { id: uuid.v4(), title }
}

export class AppStateProviderComponent extends React.Component<{}, { appState: any }> {
  constructor(props) {
    super(props)
    this.state = { 
      appState: {
        ideas: [
          CreateDummyIdea("First idea"),
          CreateDummyIdea("Second idea"),
          CreateDummyIdea("Third idea"),
          CreateDummyIdea("Fourth idea"),
          CreateDummyIdea("Fifth idea"),
        ]
      }
    }
  }

  dispatch = (operation) => {
    this.setState(state => ({ appState: ({ ...state.appState, ...operation(state.appState) }) }))
  }

  render() {
    return <AppStateProvider value={{ appState: this.state.appState, dispatch: this.dispatch }}>
      {this.props.children}
    </AppStateProvider>
  }
}

export const withStateSelector = (Component, stateSelector, actionsCreator) => {
  return class A extends React.Component<any> {
    render() {
      return <AppStateConsumer>
        {({ appState, dispatch }) => <Component {...stateSelector(appState)} {...actionsCreator(dispatch)} />}
      </AppStateConsumer>
    }

    static displayName = `withStateSelector(${Component.displayName || Component.name})`
  }
}
