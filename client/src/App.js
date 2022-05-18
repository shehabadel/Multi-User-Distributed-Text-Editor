import TextEditor from './TextEditor'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom"

const shortId = require('shortid')
function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Redirect to={`/documents/${shortId.generate()}`} />
        </Route>
        <Route path="/documents/:id">
          <TextEditor />
        </Route>
      </Switch>
    </Router>
  )
}
export default App