var notesToRender=[];
var notesRendered = {
	"YC Standard SAFE":0,
	"YC Standard Note":0,
	"YCVC SAFE":0,
	"Post money SAFE":0
}
var noteList=[];
var humanNoteList =[];
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
		const noteNumber = this.props.noteNumber;
		const humanNoteNumber = noteNumber+1

		const listOfInputs = noteIds.map((field, index)=>
	  		<div key={field.toString()}>
	  			<FieldItem noteID={field} noteField={noteFields[index]}/>
	  		</div>
		);

		if(display){
			notesRendered[noteName] += 1;
			var noteArrayID = this.props.noteName.replace(/ /g,'')+notesRendered[noteName];
			var humanNoteArrayID = this.props.noteName + notesRendered[noteName];
			if (noteList.indexOf(noteArrayID) == -1) {
				noteList.push(noteArrayID);
				humanNoteList.push(humanNoteArrayID);
	    	}
			$.getScript("calculation.js", function() {
				createNoteArray(noteList);
				addNumberFormatting();
			});
			return(
				<article id={this.props.noteName.replace(/ /g,'')+notesRendered[noteName]} className="convNote" key={noteName.toString()}>
	    			<div className="articleTitle">
						<h1>{noteName +" "+ humanNoteNumber}</h1>
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
  			<NoteItem noteName={note} noteNumber={index}/>
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

	// =========================================================================
	// Refactor this section in React is required
	// =========================================================================
	console.log('last element:' + noteList[noteList.length - 1])
	// Create table
	$('#resultsTable tr:last').after('<tr id="safe'+noteList[noteList.length - 1]+'Row"><td class="rowHead">'+humanNoteList[humanNoteList.length - 1]+'</td><td class="priceShare">0.00</td><td class="shares">0</td><td class="percentage">0.0</td></tr><tr id="You-'+noteList[noteList.length - 1]+'Row"><td class="rowHead">Your '+humanNoteList[humanNoteList.length - 1]+'</td><td class="priceShare">0.00</td><td class="shares">0</td><td class="percentage">0.0</td></tr>');

})