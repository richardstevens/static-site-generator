import prismic from './metalsmith-prismic';
import markDownContent from './getMarkdownContent';

const getDataSource = ( opts ) => {
  if ( !opts.dataSource ) return false;

  if ( typeof opts.dataSource === 'function' ) return opts.dataSource;

  if ( opts.dataSource.type === 'markdown' ) {
    return markDownContent( );
  }

  // Lets work out the datasource
  if ( opts.dataSource.type === 'prismic' ) {
    const configLinkResolver = opts.config.linkResolver instanceof Function && opts.config.linkResolver;
    return prismic({
      'url': opts.dataSource.url,
      'accessToken': opts.dataSource.accessToken,
      'linkResolver': configLinkResolver || function( ctx, doc ) {
        if ( doc.isBroken ) return '';
        return '/' + doc.uid;
      }
    });
  }

};

export default getDataSource;
