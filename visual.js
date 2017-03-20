var notesToRender=[];

// render a single input field based on: noteName, noteField, noteID
class FieldItem extends React.Component{
	render(){
		return(
			<div className="inputFieldItem">
				<div className="line"></div>
				<input type="number" id={this.props.noteID} name={this.props.noteID} placeholder="000,000"/>
				<label htmlFor={this.props.noteID}>{this.props.noteField}</label>
			</div>
		);
	}
}

// render a single note item based on: noteName, noteFields, noteIDs
class NoteItem extends React.Component{
	render(){
		const noteName = this.props.noteName;
		const noteFields = noteData[noteName].fields;
		const noteIds = noteData[noteName].fieldId;

		const listOfInputs = noteIds.map((field, index)=>
	  		<div key={field.toString()}>
	  			<FieldItem noteID={field} noteField={noteFields[index]}/>
	  		</div>
		);

		return(
			<article id={this.props.noteName} key={noteName.toString()}>
    			<div className="articleTitle">
					<h1>{this.props.noteName} <button>X</button></h1>
					<h2>Input the note data here.</h2>
    			</div>
    			<form action="" className="inputFieldGroup">
					{listOfInputs}
    			</form>
    		</article>
		);
	}
}

// render list of note items based on the notesToRender array
class NoteList extends React.Component {
  render() {
  	const notesToRender = this.props.notesToRender;
  	const listOfNotes = notesToRender.map((note) =>
  		<div key={note.toString()}>
  			<NoteItem noteName={note}/>
  		</div>
  	);
    return( 
    	<div>{listOfNotes}</div>
    );
  }
}

$('#addNewNote').on('input', function() {
	var selectedNote = $("#addNewNote option:selected").val();
	notesToRender.push(selectedNote);

	console.log(selectedNote);
	console.log(notesToRender);
	console.log(noteData[selectedNote])
	ReactDOM.render(<NoteList notesToRender={notesToRender}/> ,document.getElementById('insertNotesHere'));
	
	// make selector go back to default action
});

// make delete work


