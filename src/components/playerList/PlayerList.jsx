import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from 'axios';

import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import CircularProgress from 'material-ui/CircularProgress';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Pagination from 'material-ui-pagination';

import * as playerListActions from '../../redux/actions/playerListActions';
import style from './style.js';
import dateUtil from '../../utils/dateUtil';

class PlayerList extends Component {
    state = {
        open: false,
        dialogPlayer: 0,
        dialogNotes: []
    }

    componentDidMount() {
        this.props.playerListActions.discoverPlayers();
    }

    getPlayerInfo = (playerId) => {
        axios.get('http://api.fantasy.nfl.com/v1/players/details', {params: {playerId: playerId}})
            .then((res) => {
                console.log(res);
                this.setState({
                    dialogPlayerName: res.data.players[0].name,
                    dialogNotes: res.data.players[0].notes
                });
            });
    }

    handlePageChange = (pageNumber) => {
        this.props.playerListActions.setCurrentPageNumber(pageNumber);

        const pageStartIndex = this.props.numberOfPlayersPerPage * (pageNumber - 1);
        const pageEndIndex = pageStartIndex + this.props.numberOfPlayersPerPage;
        this.props.playerListActions.setPlayersOnThisPage(this.props.allPlayers.slice(pageStartIndex, pageEndIndex))
    }

    openDialog = (playerId) => {
        this.setState({ open: true, dialogPlayer: playerId });
        this.getPlayerInfo(playerId);
    }

    handleClose = () => {
        this.setState({ open: false });
    }

    getDialogBody = () => {
        if (this.state.dialogNotes.length === 0) {
            return (
                <div>No recent news</div>
            )
        } else {
            return this.state.dialogNotes.map((note) => {
                return (
                    <div key={note.id}>
                        <h3 style={{fontStyle: 'italic', fontWeight: 400}}>{dateUtil.getPrettyDate(note.timestamp)}</h3>
                        <h4 style={{fontWeight: 'bold'}}>Story</h4>
                        <div>{note.body}</div>
                        <h4 style={{fontWeight: 'bold'}}>Analysis</h4>
                        <div>{note.analysis}</div>
                        <hr/>
                    </div>
                )
            });
        }
    }

    render() {
        const actions = [
            <FlatButton
                label="Close"
                primary={true}
                onClick={this.handleClose}
            />,
        ];

        if (this.props.discoveringPlayers) {
            return (
                <div style={style.loading}>
                    <div style={style.loadingMessage}>Getting the latest player rankings</div>
                    <CircularProgress size={80} thickness={5} />
                </div>
            )
        } else {
            return (
                <div>
                     <Dialog
                        title={this.state.dialogPlayerName}
                        actions={actions}
                        modal={false}
                        open={this.state.open}
                        onRequestClose={this.handleClose}
                        autoScrollBodyContent={true}
                    >
                        {this.getDialogBody()}
                    </Dialog>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHeaderColumn>Player Name</TableHeaderColumn>
                                <TableHeaderColumn>Position</TableHeaderColumn>
                                <TableHeaderColumn>Team</TableHeaderColumn>
                                <TableHeaderColumn>Details</TableHeaderColumn>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                this.props.playersOnThisPage.map((player) => { 
                                    return (
                                        <TableRow key={player.id}>
                                            <TableRowColumn>{player.firstName + ' ' + player.lastName}</TableRowColumn>
                                            <TableRowColumn>{player.position}</TableRowColumn>
                                            <TableRowColumn>{player.teamAbbr}</TableRowColumn>
                                            <TableRowColumn>
                                                <button onClick={() => {this.openDialog(player.id)}}>Click me!</button>
                                            </TableRowColumn>
                                        </TableRow>
                                    );
                                })
                            }
                        </TableBody>
                    </Table>
                    <Pagination
                        current={this.props.currentPageNumber}
                        total={this.props.allPlayers.length / this.props.numberOfPlayersPerPage}
                        display={5} // show this many page numbers between the < and > arrows
                        onChange={this.handlePageChange}
                    />
                </div>
            )
        }
    }
}


const mapStateToProps = (state, props) => {
	return {
		discoveringPlayers: state.playerList.discoveringPlayers,
        allPlayers: state.playerList.allPlayers,
        playersOnThisPage: state.playerList.playersOnThisPage,
        numberOfPlayersPerPage: state.playerList.numberOfPlayersPerPage,
        currentPageNumber: state.playerList.currentPageNumber,
	};
};

const mapDispatchToProps = (dispatch) => {
  return {
    playerListActions: bindActionCreators(playerListActions, dispatch)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(PlayerList);