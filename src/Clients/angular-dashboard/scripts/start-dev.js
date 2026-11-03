const net = require('node:net');
const path = require('node:path');
const { spawn } = require('node:child_process');

const services = [
  { name: 'API gateway', port: 5000, project: '../../Gateways/ApiGateway/ApiGateway.csproj' },
  { name: 'UserService', port: 5001, project: '../../Services/UserService/UserService.API/UserService.API.csproj' },
  { name: 'HouseholdService', port: 5002, project: '../../Services/HouseholdService/HouseholdService.API/HouseholdService.API.csproj' },
  { name: 'HealthcareService', port: 5003, project: '../../Services/HealthcareService/HealthcareService.API/HealthcareService.API.csproj' },
  { name: 'BankingLoanService', port: 5004, project: '../../Services/BankingLoanService/BankingLoanService.API/BankingLoanService.API.csproj' },
  { name: 'CreditScoreService', port: 5005, project: '../../Services/CreditScoreService/CreditScoreService.API/CreditScoreService.API.csproj' }
];
const dashboardDirectory = path.resolve(__dirname, '..');
const startedProcesses = [];
let stopping = false;

function isPortListening(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    socket.setTimeout(500);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
  });
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForService(child, service) {
  const deadline = Date.now() + 30000;
  let spawnError;
  child.once('error', (error) => {
    spawnError = error;
  });

  while (Date.now() < deadline) {
    if (stopping) {
      return;
    }
    if (spawnError) {
      throw new Error(`Could not start ${service.name}: ${spawnError.message}`);
    }
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error(`${service.name} exited before listening on port ${service.port}.`);
    }
    if (await isPortListening(service.port)) {
      return;
    }
    await delay(250);
  }
  child.kill();
  throw new Error(`${service.name} did not start listening on port ${service.port} within 30 seconds.`);
}

function terminateStartedProcesses() {
  if (stopping) {
    return;
  }
  stopping = true;
  for (const child of startedProcesses) {
    if (child.exitCode === null) {
      child.kill();
    }
  }
}

process.once('SIGINT', () => {
  terminateStartedProcesses();
  process.exitCode = 130;
});
process.once('SIGTERM', () => {
  terminateStartedProcesses();
  process.exitCode = 143;
});

async function start() {
  for (const service of services) {
    if (await isPortListening(service.port)) {
      console.log(`[startup] Reusing ${service.name} already listening on port ${service.port}.`);
      continue;
    }

    console.log(`[startup] Starting ${service.name} on port ${service.port}...`);
    const child = spawn('dotnet', ['run', '--project', service.project], {
      cwd: dashboardDirectory,
      stdio: 'inherit'
    });
    startedProcesses.push(child);
    await waitForService(child, service);
  }

  if (stopping) {
    return;
  }

  console.log('[startup] Starting Angular on http://localhost:4200...');
  const angular = spawn(
    process.execPath,
    [path.join(dashboardDirectory, 'node_modules', '@angular', 'cli', 'bin', 'ng.js'), 'serve'],
    { cwd: dashboardDirectory, stdio: 'inherit' }
  );
  angular.once('error', (error) => {
    console.error(`[startup] Could not start Angular: ${error.message}`);
    terminateStartedProcesses();
  });
  angular.once('close', (code) => {
    terminateStartedProcesses();
    process.exitCode = code ?? 1;
  });
}

start().catch((error) => {
  console.error(`[startup] ${error.message}`);
  terminateStartedProcesses();
  process.exitCode = 1;
});
