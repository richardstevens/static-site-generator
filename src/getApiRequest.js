import http from 'http';
import clone from 'clone';
const debug = require( 'debug' )( 'metalsmith-getApiRequest' );

const getApiRequest = ( opts, file, callback ) => {

  const getDataForPage = ( res, cb ) => {
    let data = '';
    const response = { };
    res.on( 'data', ( d ) => {
      data += d;
    });
    res.on( 'end', ( ) => {
      data = JSON.parse( data );
      for ( let i = 0; i < data.length; i++ ) {
        let newFile = clone( file );
        if ( data[i].county && data[i].town && data[i].pagename ) {
          newFile.pageData = data[i];
          newFile.pagename = opts.dataSource.prefix + newFile.pageData.pagename + '.html';
        } else {
          newFile.pageData = data[i];
          newFile.pagename = data[i].pagename + '.html';
        }
        response[ newFile.pagename ] = newFile;
      }
      cb( response );
    });
  };

  new Promise( ( resolve ) => {
    debug( 'Getting data from', opts.host + ':' + opts.port + opts.path );
    http.get( opts, ( res ) => {
      getDataForPage( res, resolve );
    });
  }).then( ( data ) => {
    callback( data );
  });
};

export default getApiRequest;
