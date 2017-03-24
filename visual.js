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
	constructor(props) {
		super(props);
		this.state ={display:true};
	    this.handleClick = this.handleClick.bind(this);
	}
	handleClick() {
		this.setState(prevState => ({
		  display: !prevState.display
		}));
		console.log(this.state)
	}
	render(){
		const display = this.state.display
		const noteName = this.props.noteName;
		const noteFields = noteData[noteName].fields;
		const noteIds = noteData[noteName].fieldId;

		const listOfInputs = noteIds.map((field, index)=>
	  		<div key={field.toString()}>
	  			<FieldItem noteID={field} noteField={noteFields[index]}/>
	  		</div>
		);
		if(display){
			return(
				<article id={this.props.noteName} key={noteName.toString()}>
	    			<div className="articleTitle">
						<h1>{this.props.noteName}</h1>
						<button className="delete" onClick={this.handleClick}><img src="close.svg"/></button>
						<h2>Input the note data here.</h2>
	    			</div>
	    			<form action="" className="inputFieldGroup">
						{listOfInputs}
	    			</form>
	    		</article>
			);
		}
		else{
			return(
				null
			);
		}
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

	// console.log(selectedNote);
	// console.log(notesToRender);
	// console.log(noteData[selectedNote])
	ReactDOM.render(<NoteList notesToRender={notesToRender}/> ,document.getElementById('insertNotesHere'));
	$("#addNewNote").val("Add a new convertible note");
});


// make delete work for existing note
$('.delete').click(function(){
	$('.delete').parent().parent().remove()
});


