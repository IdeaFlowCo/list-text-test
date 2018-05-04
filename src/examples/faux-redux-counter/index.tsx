import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { AppStateProviderComponent } from './AppState'

import List from './List'

ReactDOM.render(
  <AppStateProviderComponent>
    <List />
  </AppStateProviderComponent>,
  document.querySelector("#reactAppMountPoint")
)