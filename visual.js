// render list of note items
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
ReactDOM.render(<Welcome name="Sara" /> ,document.getElementById('insertNotesHere'));