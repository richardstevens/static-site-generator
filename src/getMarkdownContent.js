import clone from 'clone';

const markDownContent = ( file, callback ) => {
  const newFile = clone( file );
  // Create the new page in metalsmith
  newFile.pagename = file.replace( '.md', '.html' );
  const data = { };
  data[ newFile.pagename ] = newFile;
  callback( data );
};

export default markDownContent;
