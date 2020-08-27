import MacroCommand from '../../../util/command/MacroCommand';
import ICommand from '../../../util/command/ICommand';
import LeaveSceneValidateCommand from '../loadscene/LeaveSceneValidateCommand';
import ClearSceneCommand from '../loadscene/ClearSceneCommand';
import DisposeSceneCommand from '../loadscene/DisposeSceneCommand';
import InitDataCommand from '../loadscene/InitDataCommand';
import InitViewCommand from '../loadscene/InitViewCommand';
import LoadSceneSuccCommand from '../loadscene/LoadSceneSuccCommand';
import DownloadFBCommand from './DownloadFBCommand';

export default class LoadFBCommand extends MacroCommand implements ICommand {

    //~ public methods ----------------------------------------------------

    constructor() {
        super();
        //console.log("------LoadFbCommand");
    }

    //~ protected methods -------------------------------------------------

    protected initializeMacroCommand(): void {
        this.addSubCommand(LeaveSceneValidateCommand);
        this.addSubCommand(ClearSceneCommand);
        this.addParallelSubCommand([DownloadFBCommand]);
        this.addSubCommand(DisposeSceneCommand);
        this.addSubCommand(InitDataCommand);
        this.addSubCommand(InitViewCommand);
        this.addSubCommand(LoadSceneSuccCommand);
        super.initializeMacroCommand();
    }
}