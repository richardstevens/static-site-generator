import getPrismicContent from './getPrismicData';
import getApiRequest from './getApiRequest';
import getPrismicRequest from './getPrismicRequest';
import { forEachOf } from 'async';
import _ from 'underscore';

const dataSource = ( opts ) => {

  return ( files, metalsmith, done ) => {

    const iteratePage = ( prop, filename, callback ) => {
      if ( typeof opts.dataSource === 'function' ) {
        opts.dataSource( prop, filename, callback );
      } else if ( prop.prismic ) {
        const pfiles = { };
        pfiles[filename] = prop;
        getPrismicRequest({
          'url': opts.prismic.url,
          'linkResolver': ( ctx, doc ) => {
            if ( doc.isBroken ) return '';
            return '/' + doc.uid;
          },
          'accessToken': opts.prismic.token
        }, pfiles, ( data, err ) => {
          data = getPrismicContent( data );
          if ( err ) throw err;
          delete files[ filename ];
          files = _.extend( files, data );
          callback( );
        });
      } else if ( prop.dataSource && prop.dataSource.apiRequest ) {
        const { api } = metalsmith._metadata;
        api.path = prop.dataSource.apiRequest;
        getApiRequest( api, prop, ( data, err ) => {
          if ( err ) throw err;
          delete files[filename];
          files = _.extend( files, data );
          callback( );
        });
      } else {
        callback( );
      }

    };

    forEachOf( files, iteratePage, done );
  };
};

export default dataSource;

