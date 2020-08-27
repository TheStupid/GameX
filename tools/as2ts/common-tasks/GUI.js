var SwingUtilities = Java.type("javax.swing.SwingUtilities");
var JFrame = Java.type("javax.swing.JFrame");
var JLabel = Java.type("javax.swing.JLabel");
var JButton = Java.type("javax.swing.JButton");
var JTextField = Java.type("javax.swing.JTextField");
var UIManager = Java.type("javax.swing.UIManager");
var Insets = Java.type("java.awt.Insets");
var Toolkit = Java.type("java.awt.Toolkit");
var Window = Java.type("java.awt.Window");
var Dimension = Java.type("java.awt.Dimension");
var GridBagLayout = Java.type("java.awt.GridBagLayout");
var GridBagConstraints = Java.type("java.awt.GridBagConstraints");
var DropTarget = Java.type("java.awt.dnd.DropTarget");
var DropTargetAdapter = Java.type("java.awt.dnd.DropTargetAdapter");
var DropTargetDropEvent = Java.type("java.awt.dnd.DropTargetDropEvent");
var DnDConstants = Java.type("java.awt.dnd.DnDConstants");
var DataFlavor = Java.type("java.awt.datatransfer.DataFlavor");

var System = Java.type("java.lang.System");
var Process = Java.type("java.lang.Process");
var Runtime = Java.type("java.lang.Runtime");
var Thread = Java.type("java.lang.Thread");
var InputStreamReader = Java.type("java.io.InputStreamReader");
var BufferedReader = Java.type("java.io.BufferedReader");

var MIN_SIZE = new Dimension(500, 140);

try {
	UIManager.setLookAndFeel("com.sun.java.swing.plaf.windows.WindowsLookAndFeel");
} catch (e) {
	e.printStackTrace();
}

SwingUtilities.invokeLater(function() {
	var mainFrame = new JFrame();
	var gc = new GridBagConstraints();
	var txtScene = new JTextField();
	var txtAsset = new JTextField();
	var btnGo = new JButton("GO");
	
	setMiddleOnScreen(mainFrame, MIN_SIZE.width, MIN_SIZE.height);
	
	mainFrame.setAlwaysOnTop(true);
	mainFrame.setMinimumSize(MIN_SIZE);
	mainFrame.setLayout(new GridBagLayout());
	
	// =====================================================
	
	gc.insets = new Insets(5, 5, 5, 5);
	
	gc.anchor = GridBagConstraints.EAST;
	gc.fill = GridBagConstraints.NONE;
	gc.gridx = 0;
	gc.gridy = 0;
	gc.gridwidth = 1;
	gc.gridheight = 1;
	gc.weightx = 0;
	gc.weighty = 0;
	
	mainFrame.add(new JLabel("scene: "), gc);
	
	gc.anchor = GridBagConstraints.EAST;
	gc.fill = GridBagConstraints.BOTH;
	gc.gridx = 1;
	gc.gridy = 0;
	gc.gridwidth = 1;
	gc.gridheight = 1;
	gc.weightx = 1;
	gc.weighty = 0;
	
	mainFrame.add(txtScene, gc);
	
	gc.anchor = GridBagConstraints.EAST;
	gc.fill = GridBagConstraints.NONE;
	gc.gridx = 0;
	gc.gridy = 1;
	gc.gridwidth = 1;
	gc.gridheight = 1;
	gc.weightx = 0;
	gc.weighty = 0;
	
	mainFrame.add(new JLabel("asset: "), gc);
	
	gc.anchor = GridBagConstraints.EAST;
	gc.fill = GridBagConstraints.BOTH;
	gc.gridx = 1;
	gc.gridy = 1;
	gc.gridwidth = 1;
	gc.gridheight = 1;
	gc.weightx = 1;
	gc.weighty = 0;
	
	mainFrame.add(txtAsset, gc);
	
	gc.anchor = GridBagConstraints.CENTER;
	gc.fill = GridBagConstraints.NONE;
	gc.gridx = 0;
	gc.gridy = 2;
	gc.gridwidth = 2;
	gc.gridheight = 1;
	gc.weightx = 0;
	gc.weighty = 0;
	
	mainFrame.add(btnGo, gc);
	
	// =====================================================
	
	btnGo.addActionListener(function(e) {
		btnGo.setText("EXECUTING");
		btnGo.setEnabled(false);
		txtScene.setEnabled(false);
		txtAsset.setEnabled(false);
		new Thread(function() {
			var process = Runtime.getRuntime().exec("cmd /c gulp copyRelatedRes2TargetDirectory --null --" + txtScene.getText() + " --" + txtAsset.getText());
			var input = process.getInputStream();
			var bReader = new BufferedReader(new InputStreamReader(input));
			var line;
			while ((line = bReader.readLine()) != null) {
				System.out.println(line);
			}
			SwingUtilities.invokeLater(function() {
				btnGo.setText("GO");
				btnGo.setEnabled(true);
				txtScene.setEnabled(true);
				txtAsset.setEnabled(true);
			});
		}).start();
	});
	
	new DropTarget(txtScene, DnDConstants.ACTION_COPY_OR_MOVE, new DropTargetAdapter(){
		"drop": function(dtde) {
			try {
				if (dtde.isDataFlavorSupported(DataFlavor.javaFileListFlavor)) {
					dtde.acceptDrop(DnDConstants.ACTION_COPY_OR_MOVE);
					txtScene.setText(dtde.getTransferable().getTransferData(DataFlavor.javaFileListFlavor).get(0).toString());
					dtde.dropComplete(true);
				} else {
					dtde.rejectDrop();
				}
			} catch (e) {
				e.printStackTrace();
			}
		}
	});
	new DropTarget(txtAsset, DnDConstants.ACTION_COPY_OR_MOVE, new DropTargetAdapter(){
		"drop": function(dtde) {
			try {
				if (dtde.isDataFlavorSupported(DataFlavor.javaFileListFlavor)) {
					dtde.acceptDrop(DnDConstants.ACTION_COPY_OR_MOVE);
					txtAsset.setText(dtde.getTransferable().getTransferData(DataFlavor.javaFileListFlavor).get(0).toString());
					dtde.dropComplete(true);
				} else {
					dtde.rejectDrop();
				}
			} catch (e) {
				e.printStackTrace();
			}
		}
	});
	
	mainFrame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
	mainFrame.setVisible(true);
});


function setMiddleOnScreen(window, width, height) {
	if (width <= 0) {
		width = window.getWidth();
	}
	if (height <= 0) {
		height = window.getHeight();
	}
	var screenSize = Toolkit.getDefaultToolkit().getScreenSize();
	window.setSize(width, height);
	var x = (screenSize.width - width) / 2;
	var y = (screenSize.height - height) / 2;
	window.setLocation(x, y);
}