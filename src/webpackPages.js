import path from 'path';
import webpack from 'webpack';
import fs from 'fs';
import _ from 'underscore';
import rm from 'rimraf';
import mkdirp from 'mkdirp';

let outputFiles = { };

const webpackPages = ( globalOptions ) => {

  /* Return to metalsmith */
  return ( files, metalsmith, done ) => {
    if ( !( globalOptions.webpack && globalOptions.dest && globalOptions.directory )) return done();

    globalOptions.tempDir = path.join( metalsmith._directory, '_tempOutput' );
    globalOptions.dest = path.join( metalsmith._directory, globalOptions.dest );

    const generateOutput = ( template, props, options ) => {
      const output = `var React = require( 'react' );
                      var { render } = require( 'react-dom' );
                      var Element = require( '${template}' );
                      if ( typeof Element.default === 'function' ) Element = Element.default;
                      var props = ${JSON.stringify( props )};
                      var renderedElement = render( <Element {...props} />, document.getElementById( 'content' ));`;

      const destFilename = options.destFilename;
      const filename = path.join( options.tempDir, destFilename );
      outputFiles[ destFilename.replace( '.js', '' ) ] = filename;

      return new Promise((resolve, reject) => {
        mkdirp( path.dirname( filename ), error => {
          if ( error ) return reject( error );
          fs.writeFile( filename, output, ( err ) => {
            if (err) return reject(err);
            resolve('done');
          });
        });
      });
    };

    const iterator = ( prop, file ) => {
      const props = _.extend( { }, prop, metalsmith._metadata );
      props.tpl = ( globalOptions.noConflict ) ? 'rtemplate' : 'template';
      if ( !props[ props.tpl ] ) return false;
      delete props.contents;
      delete props.stats;
      delete props.mode;
      const template = path.join( metalsmith._directory, globalOptions.directory, props[ props.tpl ] );
      globalOptions.destFilename = file.replace( path.extname( file ), '' ) + '.js';
      return generateOutput( template, props, globalOptions );
    };

    const finishAll = () => {
      globalOptions.webpack.entry = outputFiles;
      webpack( globalOptions.webpack, err => {
        rm( path.join( metalsmith._directory, '_tempOutput' ), ( ) => { } );
        done( err );
      } );
    };

    const promises = Object.keys(files).map(function(key) {
      const props = files[key];
      const file = key;
      return iterator(props, file);
    });

    // Call the chain
    Promise
      .all(promises)
      .then(finishAll);
  };
};

export default webpackPages;
