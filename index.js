const prompt = require("prompt-sync")({ sigint: true });
const fs = require('node:fs');

Object.defineProperty(String.prototype, "ReplaceAll", {
    value: function replaceAll(from, to) {
        let replacedValue = JSON.parse(JSON.stringify(this));
        while (replacedValue.includes(this)) {
            replacedValue = replacedValue.replace(from, to);
        }
        return replacedValue;
    },
    writable: true,
    configurable: true,
});


const features = [{ key: "ui", value: "presentation" }, { key: "bl", value: "application" }, { key: "data", value: "data" }];


function init() {
    let isGeneratingNormal = (process.argv.length >= 3 && process.argv[2].toLowerCase() == "generate") && ((process.argv.length > 3 && process.argv[3].toLowerCase() != "presentation") || (process.argv.length == 3));
    let isGeneratingPresentation = (process.argv.length >= 3 && process.argv[2].toLowerCase() == "generate") && (process.argv.length > 3 && process.argv[3].toLowerCase() == "presentation");

    if (isGeneratingNormal) {
        startFeatureCreation();
    } else if (isGeneratingPresentation) {
        startFeaturePresentationCreation();
    } else {
        /* // default generating...
        startFeatureCreation(); */
        process.exit();
    }
}

init();


function startFeatureCreation() {

    const featureName = (getInputArg("feature_name") ?? prompt("what is feature name ? ")).toLowerCase();

    if (isValidFeatureName(featureName)) {

        const createApplication = promptIsYes(prompt("create application ? (yes/y) "));

        const createPresentation = promptIsYes(prompt("create presentation ? (yes/y) "));

        const createData = promptIsYes(prompt("create data ? (yes/y) "));

        if (!createApplication && !createData && !createPresentation) {
            process.exit();
        }

        let presentationOnly = !createData && !createApplication && createPresentation;

        let path = `${process.cwd()}/lib/src/features/${featureName}`;

        let inputDir = getInputArg("dir");

        if (inputDir) {

            inputDir = `/${inputDir}/`
            inputDir = inputDir.replaceAll("//", "/");

            path = `${process.cwd()}${inputDir}${featureName}`
        }

        let parsedfeatureName = "";

        featureName.split("_").forEach((data, i) => {
            parsedfeatureName += capitalize(data);
        });

        parsedfeatureName = removeCapitalize(parsedfeatureName);

        console.log(`Writing feature ${featureName} ...`);
        try {
            features.forEach((feature, i) => {
                console.log(`...`);

                switch (feature.key) {
                    case "ui":
                        if (createPresentation) {
                            writeFile(`${path}/${feature.value}`, `${featureName}_screen.dart`, screenDartData(featureName, parsedfeatureName));
                            writeFile(`${path}/${feature.value}`, `${featureName}_screen_controller.dart`, screenControllerDartData(featureName, parsedfeatureName));
                            if (presentationOnly) {
                                let feature = features.find((feature) => {
                                    return feature.key == "data";
                                });
                                if (feature) {
                                    writeFile(`${path}/${feature.value}/model`, `model.dart`, modelDartData());
                                }
                            }
                        }
                        break;

                    case "bl":
                        if (createApplication) {
                            writeFile(`${path}/${feature.value}`, `${featureName}_service.dart`, serviceDartData(featureName, parsedfeatureName)); // TODO --
                        }
                        break;

                    case "data":

                        if (createData) {
                            writeFile(`${path}/${feature.value}`, `provider.dart`, providerDartData(featureName, parsedfeatureName));// TODO --
                            writeFile(`${path}/${feature.value}`, `${featureName}_repository.dart`, repositoryDartData(featureName, parsedfeatureName));// TODO --
                            writeFile(`${path}/${feature.value}`, `${featureName}_repository.interface.dart`, repositoryInterfaceDartData(featureName, parsedfeatureName));// TODO --
                            writeFile(`${path}/${feature.value}/model`, `model.dart`, modelDartData());
                        }
                        break;

                    default:
                        break;
                }
            });
            console.log(`DONE writed feature ${featureName}`);
        } catch (error) {
            console.error(error);
        }

    } else {
        let retryResult = prompt("Feature named not valid , retry? (yes/y) ");
        if (promptIsYes(retryResult)) {
            startFeatureCreation();
        } else {
            process.exit();
        }

    }

}

function startFeaturePresentationCreation() {

    const featureName = (getInputArg("feature_name") ?? prompt("what is feature name ? ")).toLowerCase();

    if (isValidFeatureName(featureName)) {

        let presentationName = getInputArg("presentation_name") ?? prompt("what is presentation name ? ");

        if (isValidPrompt(presentationName)) {

            let path = `${process.cwd()}/lib/src/features/${featureName}`;

            let inputDir = getInputArg("dir");

            if (inputDir) {

                inputDir = `/${inputDir}/`
                inputDir = inputDir.replaceAll("//", "/");

                path = `${process.cwd()}${inputDir}${featureName}`
            }

            console.log(`Writing presentation ${presentationName} ...`);

            let parsedPresentationName = "";

            presentationName.split("_").forEach((data, i) => {
                parsedPresentationName += capitalize(data);
            });

            parsedPresentationName = removeCapitalize(parsedPresentationName);

            try {
                writeFile(`${path}/presentation`, `${presentationName}.dart`, customPresentationScreenDartData(presentationName, parsedPresentationName));
                writeFile(`${path}/presentation`, `${presentationName}_controller.dart`, customPresentationScreenControllerDartData(presentationName, parsedPresentationName));
                writeFile(`${path}/data/model`, `model.dart`, modelDartData());

                console.log(`DONE writed presentation ${presentationName}`);
            } catch (error) {
                console.error(error);
            }

        } else {
            let retryResult = prompt("presentation named not valid , retry? (yes/y) ");
            if (promptIsYes(retryResult)) {
                startFeaturePresentationCreation();
            } else {
                process.exit();
            }
        }

    } else {
        let retryResult = prompt("Feature named not valid , retry? (yes/y) ");
        if (promptIsYes(retryResult)) {
            startFeatureCreation();
        } else {
            process.exit();
        }
    }
}

function promptIsYes(result) {
    return result.toLowerCase() == "yes" || result.toLowerCase() == "y";
}

function isValidFeatureName(featureName) {
    return isValidPrompt(featureName);
}

function isValidPrompt(prompt) {
    return (prompt.length > 0);
}

function writeFile(directory, filename, fileContent) {
    try {
        fs.mkdir(directory, { recursive: true }, (err) => {
            if (err) { throw err; } else {
                if (!fs.existsSync(`${directory}/${filename}`)) {
                    fs.writeFileSync(`${directory}/${filename}`, fileContent);
                } else {
                    // skip
                }
            }
        });

    } catch (err) {
        throw Error(err);
    }
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function removeCapitalize(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

function getInputArg(key) {
    // --{key}=value

    let foundedArg = process.argv.find((arg) => {
        return arg.includes(`--${key}=`);
    })
    if (foundedArg) {
        return foundedArg.replace(`--${key}=`, "");
    } else {
        return undefined;
    }

}

// dart files data

function modelDartData() {
    return `
class Model {
    const Model();
}
    `;
}

function providerDartData(snakedFeatureName, camelCaseFeatureName) {
    let capitalizedCamelCaseFeatureName = capitalize(camelCaseFeatureName);

    return `
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '${snakedFeatureName}_repository.dart';
import '${snakedFeatureName}_repository.interface.dart';
part 'provider.g.dart';

@Riverpod(keepAlive: true)
I${capitalizedCamelCaseFeatureName}Repository ${camelCaseFeatureName}Repository(${capitalizedCamelCaseFeatureName}RepositoryRef ref) {
    return const ${capitalizedCamelCaseFeatureName}Repository();
}
    `;

}


function repositoryDartData(snakedFeatureName, camelCaseFeatureName) {
    let capitalizedCamelCaseFeatureName = capitalize(camelCaseFeatureName);
    return `
import 'model/model.dart';
import '${snakedFeatureName}_repository.interface.dart';

class ${capitalizedCamelCaseFeatureName}Repository implements I${capitalizedCamelCaseFeatureName}Repository {
    const ${capitalizedCamelCaseFeatureName}Repository();
    @override
    Future<Model> load() async {
        return const Model();
    }
}
    `;
}

function repositoryInterfaceDartData(snakedFeatureName, camelCaseFeatureName) {
    let capitalizedCamelCaseFeatureName = capitalize(camelCaseFeatureName);

    return `
import 'model/model.dart';

abstract class I${capitalizedCamelCaseFeatureName}Repository {
    Future<Model> load();
}
    `;

}

function serviceDartData(snakedFeatureName, camelCaseFeatureName) {
    let capitalizedCamelCaseFeatureName = capitalize(camelCaseFeatureName);

    return `
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../data/model/model.dart';
import '../data/${snakedFeatureName}_repository.interface.dart';
import '../data/provider.dart';
part '${snakedFeatureName}_service.g.dart';

class ${capitalizedCamelCaseFeatureName}Service {
  final I${capitalizedCamelCaseFeatureName}Repository _repo;
  const ${capitalizedCamelCaseFeatureName}Service(this._repo);
  Future<Model> load() async {
    return _repo.load();
  }
}

@Riverpod(keepAlive: true)
${capitalizedCamelCaseFeatureName}Service ${camelCaseFeatureName}Service(${capitalizedCamelCaseFeatureName}ServiceRef ref) {
  final repo = ref.read(${camelCaseFeatureName}RepositoryProvider);
  return ${capitalizedCamelCaseFeatureName}Service(repo);
}
    `;

}

function screenDartData(snakedFeatureName, camelCaseFeatureName) {
    let capitalizedCamelCaseFeatureName = capitalize(camelCaseFeatureName);
    return `
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '${snakedFeatureName}_screen_controller.dart';

class ${capitalizedCamelCaseFeatureName}Screen extends ConsumerWidget {
    const ${capitalizedCamelCaseFeatureName}Screen({super.key});

    @override
    Widget build(BuildContext context, WidgetRef ref) {
        // ignore: unused_local_variable
        final viewModelState = ref.watch(${camelCaseFeatureName}ScreenControllerProvider);
        return const Scaffold();
    }
}
    `;
}


function screenControllerDartData(snakedFeatureName, camelCaseFeatureName) {
    let capitalizedCamelCaseFeatureName = capitalize(camelCaseFeatureName);
    return `
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../data/model/model.dart';
part '${snakedFeatureName}_screen_controller.g.dart';

@Riverpod(keepAlive: false)
class ${capitalizedCamelCaseFeatureName}ScreenController extends _$${capitalizedCamelCaseFeatureName}ScreenController {
    final _initialState = const ${capitalizedCamelCaseFeatureName}ScreenControllerState.empty();
    // late final _service = ref.read(${camelCaseFeatureName}ServiceProvider);

    // @override
    // ${capitalizedCamelCaseFeatureName}ScreenControllerState get state => stateOrNull ?? _initialState;

    @override
    ${capitalizedCamelCaseFeatureName}ScreenControllerState build() {
        _initialize();
        _disposing();
        return _initialState;
    }

    Future<void> _initialize() async {
        // state = state.copyWith(data: await AsyncValue.guard(() async => await _service.load()));
    }

    void _disposing() {
        // ref.onDispose(() {});
    }
}

class ${capitalizedCamelCaseFeatureName}ScreenControllerState {
    final AsyncValue<Model> data;

    const ${capitalizedCamelCaseFeatureName}ScreenControllerState({required this.data});
    const ${capitalizedCamelCaseFeatureName}ScreenControllerState.empty({this.data = const AsyncLoading()});

    ${capitalizedCamelCaseFeatureName}ScreenControllerState copyWith({
        AsyncValue<Model>? data,
    }) {
        return ${capitalizedCamelCaseFeatureName}ScreenControllerState(
            data: data ?? this.data,
        );
    }
}
    `;
}


// only generate presentation feature


function customPresentationScreenDartData(snakedFeatureName, camelCaseFeatureName) {
    let capitalizedCamelCaseFeatureName = capitalize(camelCaseFeatureName);
    return `
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '${snakedFeatureName}_controller.dart';

class ${capitalizedCamelCaseFeatureName} extends ConsumerWidget {
    const ${capitalizedCamelCaseFeatureName}({super.key});

    @override
    Widget build(BuildContext context, WidgetRef ref) {
        // ignore: unused_local_variable
        final viewModelState = ref.watch(${camelCaseFeatureName}ControllerProvider);
        return const Scaffold();
    }
}
    `;
}


function customPresentationScreenControllerDartData(snakedFeatureName, camelCaseFeatureName) {
    let capitalizedCamelCaseFeatureName = capitalize(camelCaseFeatureName);
    return `
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../data/model/model.dart';
part '${snakedFeatureName}_controller.g.dart';

@Riverpod(keepAlive: false)
class ${capitalizedCamelCaseFeatureName}Controller extends _$${capitalizedCamelCaseFeatureName}Controller {
    final _initialState = const ${capitalizedCamelCaseFeatureName}ControllerState.empty();
    // late final _service = ref.read(${camelCaseFeatureName}ServiceProvider);

    // @override
    // ${capitalizedCamelCaseFeatureName}ControllerState get state => stateOrNull ?? _initialState;

    @override
    ${capitalizedCamelCaseFeatureName}ControllerState build() {
        _initialize();
        _disposing();
        return _initialState;
    }

    Future<void> _initialize() async {
        // state = state.copyWith(data: await AsyncValue.guard(() async => await _service.load()));
    }

    void _disposing() {
        // ref.onDispose(() {});
    }
}

class ${capitalizedCamelCaseFeatureName}ControllerState {
    final AsyncValue<Model> data;

    const ${capitalizedCamelCaseFeatureName}ControllerState({required this.data});
    const ${capitalizedCamelCaseFeatureName}ControllerState.empty({this.data = const AsyncLoading()});

    ${capitalizedCamelCaseFeatureName}ControllerState copyWith({
        AsyncValue<Model>? data,
    }) {
        return ${capitalizedCamelCaseFeatureName}ControllerState(
            data: data ?? this.data,
        );
    }
}
    `;
}