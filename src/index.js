const React = require('react');
const Anser = require('anser');

function Ansi(props) {
  return <code dangerouslySetInnerHTML={{__html: Anser.linkify(Anser.ansiToHtml(props.children))}} />
}

Ansi.propTypes = {
  children: React.PropTypes.string,
};

module.exports = Ansi;
