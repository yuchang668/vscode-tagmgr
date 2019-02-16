import * as vscode from 'vscode';
import StatusBar from './StatusBar';
import Configuration from './configuration';
import DefinitionProvider from './definitionProvider';
import ReferenceProvider from './referenceProvider';
import DocumentSymbolProvider from './documentSymbolProvider';
import CompletionItemProvider from './completionItemProvider';

const extpatn = '**/*.{adb,ads,Ada,ada,build.xml,ant,xml,asc,adoc,asciidoc,asm,ASM,s,S,asp,asa,ac,au3,AU3,aU3,Au3,am,awk,gawk,mawk,bas,bi,bb,pb,bet,clj,cljs,cljc,cmake,c,c++,cc,cp,cpp,cxx,h,h++,hh,hp,hpp,hxx,inl,css,cs,ctags,cbl,cob,CBL,COB,cu,cuh,d,di,diff,patch,dtd,mod,dts,dtsi,bat,cmd,e,elm,erl,ERL,hrl,HRL,fal,ftd,as,mxml,f,for,ftn,f77,f90,f95,f03,f08,f15,fy,gdb,go,htm,html,ini,conf,itcl,java,properties,js,jsx,json,lds,scr,ld,cl,clisp,el,l,lisp,lsp,lua,m4,spt,1,2,3,4,5,6,7,8,9,3pm,3stap,7stap,mak,mk,md,markdown,m,myr,mm,m,h,c++,cc,cp,cpp,cxx,h,h++,hh,hp,hpp,hxx,inl,c,ml,mli,aug,p,pas,pl,pm,ph,plx,perl,p6,pm6,pm,pl6,php,php3,php4,php5,php7,phtml,pod,proto,pp,py,pyx,pxd,pxi,scons,wsgi,hx,r,R,s,q,cmd,rexx,rx,robot,spec,rest,reST,rst,rb,ruby,rs,SCM,SM,sch,scheme,scm,sm,sh,SH,bsh,bash,ksh,zsh,ash,sl,sml,sig,sql,unit,service,socket,device,mount,automount,swap,target,path,timer,snapshot,scope,slice,time,tcl,tk,wish,exp,tex,ttcn,ttcn3,vr,vri,vrh,v,sv,svh,svi,vhdl,vhd,vim,vba,rc,y,repo,zep,xml,glade,pom,xml,plist,rng,svg,xsl,xslt}';

export function activate({ subscriptions }: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "vscode-tagmgr" is now active!');

	let config = new Configuration();
	let statusBar = new StatusBar(config, 'extension.updateTags');
	subscriptions.push(statusBar);
	subscriptions.push(vscode.commands.registerCommand('extension.updateTags', () => statusBar.sync()));
	subscriptions.push(vscode.commands.registerCommand('extension.buildTags', () => statusBar.sync(true)));

	let fswatcher = vscode.workspace.createFileSystemWatcher(extpatn);
	fswatcher.onDidCreate(event => statusBar.sync(event.fsPath));
	fswatcher.onDidChange(event => statusBar.sync(event.fsPath));
	fswatcher.onDidDelete(event => statusBar.sync(event.fsPath));
	subscriptions.push(fswatcher);
	subscriptions.push(vscode.languages.registerDefinitionProvider({ scheme: 'file', pattern: extpatn }, new DefinitionProvider(config)));
	subscriptions.push(vscode.languages.registerReferenceProvider({ scheme: 'file', pattern: extpatn }, new ReferenceProvider(config)));
	subscriptions.push(vscode.languages.registerCompletionItemProvider({ scheme: 'file', pattern: extpatn }, new CompletionItemProvider(config)));
	subscriptions.push(vscode.languages.registerDocumentSymbolProvider({ scheme: 'file', pattern: extpatn }, new DocumentSymbolProvider(config)));
}

export function deactivate() { }
