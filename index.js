const prompt = require("prompt-sync")({ sigint: true });
const fs = require('node:fs');

const features = [{ key: "ui", value: "presentation" }, { key: "bl", value: "application" }, { key: "data", value: "data" }];

function startFeatureCreation() {

    const featureName = prompt("what is feature name ? ").toLowerCase();

    if (isValidFeatureName(featureName)) {

        const createApplication = promptIsYes(prompt("create application ? (yes/y) "));

        const createPresentation = promptIsYes(prompt("create presentation ? (yes/y) "));

        const createData = promptIsYes(prompt("create data ? (yes/y) "));

        if(!createApplication && !createData && !createPresentation){
            process.exit();
        }

        let presentationOnly = !createData && !createApplication && createPresentation;

        let path = `${process.cwd()}/lib/src/features/${featureName}`;

        console.log(`Writing feature ${featureName} ...`);
        try {
            features.forEach((feature, i) => {
                console.log(`...`);

                switch (feature.key) {
                    case "ui":
                        if (createPresentation) {
                            writeFile(`${path}/${feature.value}`, `${featureName}_screen.dart`, screenDartData(featureName));
                            writeFile(`${path}/${feature.value}`, `${featureName}_screen_controller.dart`, screenControllerDartData(featureName));
                            if(presentationOnly){
                                let feature = features.find((feature)=>{
                                    return feature.key == "data";
                                });
                                if(feature){
                                    writeFile(`${path}/${feature.value}/model`, `model.dart`, modelDartData());
                                }
                            }
                        }
                        break;

                    case "bl":
                        if (createApplication) {
                            writeFile(`${path}/${feature.value}`, `${featureName}_service.dart`, serviceDartData(featureName));
                        }
                        break;

                    case "data":

                        if (createData) {
                            writeFile(`${path}/${feature.value}`, `provider.dart`, providerDartData(featureName));
                            writeFile(`${path}/${feature.value}`, `${featureName}_repository.dart`, repositoryDartData(featureName));
                            writeFile(`${path}/${feature.value}`, `${featureName}_repository.interface.dart`, repositoryInterfaceDartData(featureName));
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

function promptIsYes(result) {

    return result.toLowerCase() == "yes" || result.toLowerCase() == "y";

}

function isValidFeatureName(featureName) {
    return (featureName.length > 0);
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


startFeatureCreation();

// dart files data


function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


function modelDartData() {
    return `
class Model {
    const Model();
}
    `;
}

function providerDartData(featureName) {

    let capitalizedFeatureName = capitalize(featureName);

    return `
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '${featureName}_repository.dart';
import '${featureName}_repository.interface.dart';
part 'provider.g.dart';

@Riverpod(keepAlive: true)
I${capitalizedFeatureName}Repository ${featureName}Repository(${capitalizedFeatureName}RepositoryRef ref) {
return const ${capitalizedFeatureName}Repository();
}
    `;

}


function repositoryDartData(featureName) {
    let capitalizedFeatureName = capitalize(featureName);
    return `
import 'model/model.dart';
import '${featureName}_repository.interface.dart';

class ${capitalizedFeatureName}Repository implements I${capitalizedFeatureName}Repository {
    const ${capitalizedFeatureName}Repository();
    @override
    Future<Model> load() async {
        return const Model();
    }
}
    `;
}

function repositoryInterfaceDartData(featureName) {
    let capitalizedFeatureName = capitalize(featureName);

    return `
import 'model/model.dart';

abstract class I${capitalizedFeatureName}Repository {
Future<Model> load();
}
    `;

}

function serviceDartData(featureName) {
    let capitalizedFeatureName = capitalize(featureName);

    return `
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../data/model/model.dart';
import '../data/${featureName}_repository.interface.dart';
import '../data/provider.dart';
part '${featureName}_service.g.dart';

class ${capitalizedFeatureName}Service {
  final I${capitalizedFeatureName}Repository _repo;
  const ${capitalizedFeatureName}Service(this._repo);
  Future<Model> load() async {
    return _repo.load();
  }
}

@Riverpod(keepAlive: true)
${capitalizedFeatureName}Service ${featureName}Service(${capitalizedFeatureName}ServiceRef ref) {
  final repo = ref.read(${featureName}RepositoryProvider);
  return ${capitalizedFeatureName}Service(repo);
}
    `;

}

function screenDartData(featureName) {
    let capitalizedFeatureName = capitalize(featureName);
    return `
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '${featureName}_screen_controller.dart';

class ${capitalizedFeatureName}Screen extends ConsumerWidget {
    const ${capitalizedFeatureName}Screen({super.key});

    @override
    Widget build(BuildContext context, WidgetRef ref) {
    // ignore: unused_local_variable
    final viewModelState = ref.watch(${featureName}ScreenControllerProvider);
    return const Scaffold();
    }
}
    `;
}


function screenControllerDartData(featureName) {
    let capitalizedFeatureName = capitalize(featureName);
    return `
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../data/model/model.dart';
part '${featureName}_screen_controller.g.dart';

@Riverpod(keepAlive: false)
class ${capitalizedFeatureName}ScreenController extends _$${capitalizedFeatureName}ScreenController {
    final _initialState = const ${capitalizedFeatureName}ScreenControllerState.empty();
    // late final _service = ref.read(${featureName}Serviceprovider);

    // @override
    // ${capitalizedFeatureName}ScreenControllerState state => stateOrNull ?? _initialState;

    @override
    ${capitalizedFeatureName}ScreenControllerState build() {
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

class ${capitalizedFeatureName}ScreenControllerState {
    final AsyncValue<Model> data;

    const ${capitalizedFeatureName}ScreenControllerState({required this.data});
    const ${capitalizedFeatureName}ScreenControllerState.empty({this.data = const AsyncLoading()});

    ${capitalizedFeatureName}ScreenControllerState copyWith({
    AsyncValue<Model>? data,
    }) {
    return ${capitalizedFeatureName}ScreenControllerState(
        data: data ?? this.data,
    );
    }
}
    `;
}