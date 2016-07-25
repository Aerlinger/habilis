import { expect } from 'chai';
import { spawn } from 'child_process';

xdescribe("Child process", () => {

  it("spawns a child process", (done)=> {
    const ls = spawn('ls', ['-lh', '/usr']);

    ls.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);

      expect(data.toString()).to.have.string('X11')

      done()
    });

    ls.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });
  });

})
