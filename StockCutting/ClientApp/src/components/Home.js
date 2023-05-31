import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { withStyles } from "@material-ui/core/styles";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { DataGrid } from '@material-ui/data-grid';
import DeleteIcon from '@material-ui/icons/Delete';
import HSBar from "react-horizontal-stacked-bar-chart";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddIcon from '@material-ui/icons/Add';
import AssessmentIcon from '@material-ui/icons/Assessment';



const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(1),
        textAlign: 'left',
        color: theme.palette.text.secondary,
    },
    buttonPaper: {
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    paperAlignRight: {
        padding: theme.spacing(1),
        textAlign: 'right',
        color: theme.palette.text.secondary,
    },
    formRoot: {
        margin: theme.spacing(1),
        width: '100%',
    },
});

const columns = [
    { field: 'barName', headerName: 'Bar Name', width: 100 },
    { field: 'barLength', type: 'number', headerName: 'Bar Length', width: 100 },
    { field: 'cutLength', type: 'number', headerName: 'Cut: Length', width: 100 },
    { field: 'cutQty', type: 'number', headerName: 'Cut: Qty', width: 100 }
  ];


class Home extends Component {
    static displayName = Home.name;

    constructor(props) {
        super(props);
        this.state = { 
            tableRow: [], 
            loading: true,
            txtBarName: '',
            txtWaste: 0,
            txtLength: 0,
            txtCuttingLength: 0,
            txtQty: 0,
            graphData: null
        };
        this.addItemHandler = this.addItemHandler.bind(this);
        this.textFieldHandler = this.textFieldHandler.bind(this);
        this.drawGraph = this.drawGraph.bind(this);
        this.calculateStock = this.calculateStock.bind(this);
        this.callRestGetTime = this.callRestGetTime.bind(this);
        this.testServer = this.testServer.bind(this);
        this.callRestGetstock = this.callRestGetstock.bind(this);
        this.createGraphBars = this.createGraphBars.bind(this);
    }

    addItemHandler(e){
        try{
            const {txtBarName, txtLength, txtCuttingLength, txtQty, tableRow} = this.state;
            if(txtBarName.trim() === '') {
                toast.warn('Bar Name Missing. ', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                return;
            }

            if(!Number.isInteger(parseInt(txtLength))) {
                toast.warn('Incorrect Bar Length ', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                return;
            }

            if(parseInt(txtLength) <= 0) {
                toast.warn('Bar Length must > 0', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                return;
            }

            if(!Number.isInteger(parseInt(txtCuttingLength))) {
                toast.warn('Incorrect Cutting Length ', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                return;
            }

            if(parseInt(txtCuttingLength) <= 0) {
                toast.warn('Cutting Length must > 0', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                return;
            }

            if(!Number.isInteger(parseInt(txtQty))) {
                toast.warn('Incorrect Cutting Length ', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                return;
            }

            if(parseInt(txtQty) <=0) {
                toast.warn('Cutting Qty must > 0 ', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                return;
            }

            var tableItem = {
                barName: txtBarName.trim(),
                barLength: parseInt(txtLength),
                cutLength: parseInt(txtCuttingLength),
                cutQty: parseInt(txtQty)
            };
            tableRow.push(tableItem);
            this.setState({
                tableRow: tableRow,
            });
        }catch(ex) {
            toast.warn('Error While Adding Data. ' + ex.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
        
    }

    textFieldHandler(e) {
        try{
            this.setState({
                [e.target.id]: e.target.value,
            });
        }catch(ex){
            toast.warn('Error While Setting State ' + ex.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
        
    }

    createGraphBars(data){
        const ret = data.map((item, index) => {
            const solutions = item.solutions;
            const barName = item.barName;
            const remain = item.remain;
            const barLength = item.barLength;
            const bars = [];
            for(let i = 0; i < solutions.length; i++){
                const bar = {
                    value: solutions[i],
                    description: solutions[i] + ' (mm)'
                }
                bars.push(bar);
            }
            const rem = {
                value: remain,
                description: 'Rem ' + remain + ' (mm)'
            };
            bars.push(rem);
            
            return (<div>
                <br></br>
                <span>{barName + ' - ' + barLength + ' (mm)' }</span>
                <br></br>
                <HSBar
                    showTextIn
                    data={bars}
                />
            </div>);
        });

        return ret;
    }

    drawGraph(data) {
        try{
            const {graphData} = this.state;
            if(!graphData){
                return(
                    <React.Fragment>
                        <span>First Add data then click on Calculate to shows cutting details.</span>
                    </React.Fragment>
                );
            } else {
                return(
                    <React.Fragment>
                        {this.createGraphBars(graphData)}
                    </React.Fragment>
                );
            }
        } catch(ex) {
            toast.error('🦄 Error while drawing Graph !!!! ' + ex.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
        

        


        // return(
        //     <React.Fragment>
        //         <div>
        //             <HSBar
        //                 showTextIn    
        //                 data={[
        //                     { value: 10000, description: "10.00" },
        //                     { value: 5000, description: "5.00" },
        //                     { value: 3000, description: "3.00" }
        //                 ]}
        //             />
        //         </div>
        //         <br></br>
        //         <div>
        //             <HSBar
        //                 showTextIn    
        //                 data={[
        //                     { value: 10000, description: "10.00" },
        //                     { value: 5000, description: "5.00" },
        //                     { value: 3000, description: "3.00" },
        //                     { value: 2000, description: "3.00" }
        //                 ]}
        //             />
        //         </div>
        //         <br></br>
        //         <div>
        //             <HSBar
        //                 showTextIn    
        //                 data={[
        //                     { value: 8000, description: "10.00" },
        //                     { value: 5000, description: "5.00" },
        //                     { value: 3000, description: "3.00" },
        //                     { value: 5000, description: "3.00" },
        //                     { value: 2000, description: "3.00" }
        //                 ]}
        //             />
        //         </div>
        //     </React.Fragment>
        // );
    }

    async calculateStock(e) {
        this.callRestGetstock();
    }

    async testServer(e) {
        await this.callRestGetTime();
    }

    async callRestGetTime(){
        try{
            //const url = 'https://localhost:44311/api/WaisteManager/gettime';
            const url = 'http://api.rangaaluminium.com/api/WaisteManager/gettime';
            const res = await axios.get(url);
            const data = res.data;
            toast.success(data, 
                {
                    position: "top-right",
                    autoClose: 10000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
        } catch(ex){
            toast.error('🦄 Error !!!! ' + ex.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
        
    }

    async callRestGetstock() {
        const { tableRow, txtWaste } = this.state;
        const cuttingItems = [];
        try{
            for(let i = 0; i < tableRow.length; i++){
                const cutItem = {
                    itemName: tableRow[i].barName,
                    itemLength: tableRow[i].cutLength,
                    itemQty: tableRow[i].cutQty,
                    mainBarLength: tableRow[i].barLength
                }
                cuttingItems.push(cutItem);
            }
        }catch(ex){
            toast.warn('Error While Preparing POST Data. ' + ex.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }

        try{
            const postData = {
                cuttingItems: cuttingItems,
                CuttingWaiste: txtWaste
            }

            if(!(cuttingItems && cuttingItems.length > 0)){
                toast.warn('No Details found for calculation', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                return;
            }

            //const url = 'https://localhost:44311/api/WaisteManager/getstock';
            const url = 'http://api.rangaaluminium.com/api/WaisteManager/getstock';
            const res = await axios.post(url, postData);
            const data = res.data;
            toast.success('Calculation Success', 
                {
                    position: "top-right",
                    autoClose: 10000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            this.setState({
                graphData: data
            });
            

        }catch(ex) {
            toast.error('Error While Preparing REST call. ' + ex.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    }

    render () {
        const { classes } = this.props;
        const { tableRow } = this.state;
        const rows = [];
        for(var i =0; i < tableRow.length; i++){
            const tmpRow = {
                id: i+1,
                barName: tableRow[i].barName,
                barLength: tableRow[i].barLength,
                cutLength: tableRow[i].cutLength,
                cutQty: tableRow[i].cutQty,
            }
            rows.push(tmpRow);
        }

        return (
            <React.Fragment>
                <div className={classes.root}>
                    <Grid container spacing={1}>
                        {/* Interactive data goes here */}
                        <Grid item xs={6}>
                            <Grid container spacing={1}>
                                <form className={classes.formRoot} noValidate autoComplete="off">
                                    <Grid item xs={12}>
                                        <Paper className={classes.paper} elevation={3}>
                                            <fieldset>
                                                <legend>Bar Details</legend>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={6}>
                                                        <Paper className={classes.paper} elevation={1}>
                                                            <TextField required id="txtBarName" label="Bar Name" onChange={this.textFieldHandler} value={this.state.txtBarName} />
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Paper className={classes.paper} elevation={1}>
                                                            <TextField required type="number" id="txtWaste" onChange={this.textFieldHandler} label="Waste (mm)" value={this.state.txtWaste} />
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={12}>
                                                        <Paper className={classes.paper} elevation={1}>
                                                            <TextField required type="number" id="txtLength" onChange={this.textFieldHandler} label="Length (mm)" value={this.state.txtLength} />
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                            </fieldset>

                                            <fieldset>
                                                <legend>Cutting Details</legend>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={6}>
                                                        <Paper className={classes.paper} elevation={1}>
                                                            <TextField required type="number" id="txtCuttingLength" onChange={this.textFieldHandler} label="Cutting Length (mm)" value={this.state.txtCuttingLength} />
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Paper className={classes.paper} elevation={1}>
                                                            <TextField required type="number" id="txtQty" onChange={this.textFieldHandler} label="Number of Parts" value={this.state.txtQty} />
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={5}>
                                                        <div>
                                                            <br></br>
                                                            <Button variant="contained" startIcon={<AssessmentIcon />} onClick={this.calculateStock} color="primary">Calculate</Button>
                                                        </div>
                                                        
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        <div>
                                                            <br></br>
                                                            <Button variant="contained" onClick={async () => {await this.testServer();}} color="primary">Test</Button>
                                                        </div>
                                                    </Grid>
                                                    <Grid item xs={3}>
                                                        <div>
                                                            <br></br>
                                                            <Button variant="contained" startIcon={<DeleteIcon />} color="secondary">Remove</Button>
                                                        </div>
                                                        
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        <div>
                                                            <br></br>
                                                            <Button variant="contained" startIcon={<AddIcon />} onClick={async () => {await this.addItemHandler();}} color="primary">Add</Button>
                                                        </div>
                                                    </Grid>
                                                    
                                                </Grid>
                                            </fieldset>
                                            
                                            <fieldset>
                                                <legend>Selected Details</legend>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={12}>
                                                        <Paper className={classes.paper} elevation={1}>
                                                            <div style={{ height: 400, width: '100%' }}>
                                                                <DataGrid rows={rows} columns={columns} pageSize={5} checkboxSelection />
                                                            </div>
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                            </fieldset>
                                        </Paper>
                                    </Grid>
                                </form>
                            </Grid>
                        </Grid>
                        {/* End of Interactive data goes here */}
                        {/* Graph goes here */}
                        <Grid item xs={6}>
                            <Grid container spacing={1}>
                                <Grid item xs={12}>
                                    <Paper className={classes.paper} elevation={3}>
                                        <h3>Optimal Cutting</h3>
                                        {this.drawGraph()}
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Grid>
                        {/* End of Graph goes here */}
                    </Grid>
                </div>
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
                <ToastContainer />
            </React.Fragment>
        );
    }

}

export default withStyles(styles, { withTheme: true })(Home);
