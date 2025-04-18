const express = require('express');
const Web3 = require('web3');
const app = express();
const PORT = 3000;

// Connect to Ethereum network (use Infura or local node)
const web3 = new Web3('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID');

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Smart Contract ABI and Address
const charityContractABI = [/* Your contract ABI here */];
const charityContractAddress = '0x...'; // Your deployed contract address
const charityContract = new web3.eth.Contract(charityContractABI, charityContractAddress);

// API Endpoints
app.post('/api/donate', async (req, res) => {
    const { fromAddress, amount, projectId } = req.body;
    
    try {
        const tx = await charityContract.methods.donate(projectId)
            .send({ from: fromAddress, value: web3.utils.toWei(amount, 'ether') });
        
        res.json({ success: true, transactionHash: tx.transactionHash });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/projects', async (req, res) => {
    try {
        const projectCount = await charityContract.methods.projectCount().call();
        const projects = [];
        
        for (let i = 1; i <= projectCount; i++) {
            const project = await charityContract.methods.projects(i).call();
            projects.push({
                id: i,
                name: project.name,
                description: project.description,
                targetAmount: web3.utils.fromWei(project.targetAmount, 'ether'),
                raisedAmount: web3.utils.fromWei(project.raisedAmount, 'ether'),
                imageUrl: project.imageUrl
            });
        }
        
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});