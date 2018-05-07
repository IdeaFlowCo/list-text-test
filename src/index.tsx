import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { AppStateProviderComponent } from './AppState'

import List from './List'
import CaretControlTest from './CaretControlTest'

ReactDOM.render(
  <AppStateProviderComponent>
    <List />
    {/* <CaretControlTest /> */}
  </AppStateProviderComponent>,
  document.querySelector("#reactAppMountPoint")
)