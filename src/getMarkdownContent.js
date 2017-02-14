import clone from 'clone';

const markDownContent = ( ) => {

  return ( files, metalsmith, done ) => {

    // Make request to the API endpoint in the markdown file
    const getDataForPage = ( fileName ) => {
      const newFile = clone( files[ fileName ] );
      // Create the new page in metalsmith
      newFile.pagename = fileName.replace( '.md', '.html' );
      files[ newFile.pagename ] = newFile;
      // Remove the markdown file from metalsmith as its not an actual page
      delete files[ fileName ];
    };

    // Loop over all the markdown files and create a file system
    Object.keys( files ).map( getDataForPage );
    done( );
  };
};

export default markDownContent;
