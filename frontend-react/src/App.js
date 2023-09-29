
import React, {useState, useEffect} from 'react';
import './App.css';
import {
  Grid,
  Paper,
  Select,
  MenuItem
} from '@material-ui/core'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import LinearProgress from '@material-ui/core/LinearProgress'
import AlertDialog from './components/AlertDialog'
import { useFactoryContract } from './context/FactoryContext';
import { useMyTokenContract } from './context/MyTokenContext';
import { useCustomWallet } from './context/CustomWalletContext';


const App = () => {
    
  const [isProgressing, setIsProgressing] = useState(false);
  const [tokenMintAmount, setTokenMintAmount] = useState(0);
  const [tokenAddresses, setTokenAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');

  const alertRef = React.createRef();

  const {
    connectMetamask,
    address,
    shortAddr
  } = useCustomWallet();

  const {
    balance,
    balanceOf,
    mintedCount,
    getMintedCount,
    ownerOf,
    tokenURI,
    mint,
    setTokenAddress,
    loadingTokenData,
    isInitTokenLoading
  } = useMyTokenContract();

  const {
    addressList,
    getAddresses,
    getLastCollection,
    createCollection,
    mintToken,
    loadingFactoryData,
    isInitLoading
  } = useFactoryContract();

  useEffect(() => {
    if (!addressList) return;
    console.log("addr List : ", addressList)
    setTokenAddresses(addressList);
  }, [addressList])

  useEffect(() => {
    setTokenMintAmount(balance)
  }, [balance])


  const btnStyle = {
    width: 120,
    float: 'right',
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 20,
    minWidth: 180,
  }

  const onConect = () => {
    connectMetamask();
  }

  const mintNFT = async () => {
    console.log('Token Mint');
    
    if (!address) {
      if (alertRef){
        alertRef.current.showDialog('Warning!', 'Please connect metamask first', () => {})
      }      
      connectMetamask();
      return;
    }

    try {
      setIsProgressing(true)
      const res = await mintToken(selectedAddress, address, 'https://base_uri', (hash) => {

      });
      await loadingFactoryData();
      setIsProgressing(false)
    } catch (ex) {
        console.log(ex);
        if (alertRef){
          alertRef.current.showDialog('Error!', ex.error ? ex.error.message : ex.message, () => {})
        }
        setIsProgressing(false)
    }

    try{
      const res = await balanceOf(address)
      setTokenMintAmount(res)
    } catch (error){
      console.log(error);
        if (alertRef){
          alertRef.current.showDialog('Error!', error.error ? error.error.message : error.message, () => {})
        }
    }
  }

  const collectionCreate = async () => {
    console.log('Create Collection');
    if (!address) {
      if (alertRef){
        alertRef.current.showDialog('Warning!', 'Please connect metamask first', () => {})
      }      
      connectMetamask();
      return;
    }

    try {
      setIsProgressing(true)
      const res = await createCollection("Token", "Token", 'https://base_uri', (hash) => {

      });
      await loadingFactoryData();
      setIsProgressing(false)
    } catch (ex) {
        console.log(ex);
        if (alertRef){
          alertRef.current.showDialog('Error!', ex.error ? ex.error.message : ex.message, () => {})
        }
        setIsProgressing(false)
    }   
  }

  const loadingAddressData = async () => {
    
  }
 
  useEffect(() => {
    if (address){
      loadingAddressData();
    }
    
  }, [address])

  return (
    <div className="App">
      <header className="App-header">
        <Button
              fontFamily={'broken-console'}
              bg={'#0000'}
              bordercolor={'black'}
              borderwidth={6}
              wordbreak={'break-word'}
              color="primary"
              onClick={onConect}>
              Connect metamask
        </Button> 
        <div style={{ paddingLeft: 15 }}>
          <Typography variant="subtitle1">Address : {shortAddr}</Typography>
        </div>    
        <div className="App-body">
        <Grid 
                item sm={4} 
                xs={12} >
            <Paper
                elevation={0}
                style={{
                  padding: 10,
                  backgroundColor: '#F4F4F4',
                  borderRadius: 5,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ paddingLeft: 15 }}>
                    <Typography variant="subtitle1">Factory Contract</Typography>
                  </div>
                  <div style={{ padding: 10, width:'100%' }}>
                   { isProgressing? <LinearProgress variant="indeterminate"/> : null}
                  </div>                 
                  
                  <Button
                          variant="contained"
                          size="medium"
                          color="primary"
                          style={btnStyle}
                          onClick={collectionCreate}
                        > Create Collection </Button>
                  <FormControl style={{ width: '70%' }}>
                      <InputLabel htmlFor="filled-basic">Collection Addresses</InputLabel>
                      <Select
                        labelId="filled-basic"
                        id="demo-simple-select"
                        value={selectedAddress}
                        onChange={(event)=> {
                          console.log("selected : ", event.target.value)
                          setSelectedAddress(event.target.value)
                          setTokenAddress(event.target.value);
                        }}
                      >
                        { tokenAddresses.map((item, index) => {
                          return (<MenuItem value={item}>{item}</MenuItem>)
                        })}                        
                      </Select>
                      
                    </FormControl>
                  
              </div>
            </Paper>
          </Grid>    

          <Grid 
                item sm={4} 
                xs={12} >
            <Paper
                elevation={0}
                style={{
                  padding: 10,
                  marginLeft: 20,
                  backgroundColor: '#F4F4F4',
                  borderRadius: 5,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ paddingLeft: 15 }}>
                    <Typography variant="subtitle1">Collection</Typography>
                  </div>
                  <div style={{ padding: 10, width:'100%' }}>
                    { isProgressing? <LinearProgress /> : null}
                  </div>
                  
                  <Button
                          variant="contained"
                          size="medium"
                          color="primary"
                          style={btnStyle}
                          onClick={mintNFT}
                        > Mint </Button>                  
                </div>
                <div >
                    <Typography variant="body1">Mint Count : {tokenMintAmount}</Typography>
                  </div>
            </Paper>
          </Grid>
          
        </div>
            
      </header>
      <AlertDialog ref={alertRef} okTitle={'done'} />
    </div>
  );
}

export default App;
