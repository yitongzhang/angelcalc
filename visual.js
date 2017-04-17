var notesToRender=[];
var notesRendered = {
	"YC Standard SAFE":0,
	"YC Standard Note":0,
	"YCVC SAFE":0,
	"Post money SAFE":0
}
var noteList=[];

// render a single input field based on: noteName, noteField, noteID
class FieldItem extends React.Component{
	render(){
		return(
			<div className="inputFieldItem">
				<div className="line"></div>
				<input id={this.props.noteID} name={this.props.noteID} className="number" type="text"  placeholder="000,000"/>
				<label htmlFor={this.props.noteID}>{this.props.noteField}</label>
			</div>
		);
	}
}

// render a single note item based on: noteName, noteFields, noteIDs
class NoteItem extends React.Component{

	// increment counter

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
			// noteList = [];
			notesRendered[noteName] += 1;
			// console.log(notesRendered[noteName]);
			var noteArrayID = this.props.noteName.replace(/ /g,'')+notesRendered[noteName];
			if (noteList.indexOf(noteArrayID) == -1) {
				noteList.push(noteArrayID);
	    }
			$.getScript("calculation.js", function() {
				createNoteArray(noteList);
				addNumberFormatting();
			});
			return(
				<article id={this.props.noteName.replace(/ /g,'')+notesRendered[noteName]} className="convNote" key={noteName.toString()}>
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
  	const listOfNotes = notesToRender.map((note,index) =>
  		<div key={note.toString()+index}>
  			<NoteItem noteName={note}/>
  		</div>
  	);
  	
    return( 
    	<div>{listOfNotes}</div>
    );
  }
}

$('#addNewNote').on('click', function() {
	// // Uncomment the following to render different notes
	// var selectedNote = $("#addNewNote option:selected").val();
	// notesToRender.push(selectedNote);
	var selectedNote = 'YC Standard SAFE';
	notesToRender.push(selectedNote);

	ReactDOM.render(<NoteList notesToRender={notesToRender}/> ,document.getElementById('insertNotesHere'));

	// // Uncomment the following to render different notes
	// $("#addNewNote").val("Add a new convertible note");

	// Reset note ID counter
	notesRendered["YC Standard SAFE"]=0;

	// console.log(noteList);
	// Call functions from calculation.js
	// $.getScript("calculation.js", function() {
	// 	createNoteArray();
	// 	addNumberFormatting();
	// });

});