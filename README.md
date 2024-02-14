...
    
    🔥🔥 READ 🔥🔥
    
    1 : 
        install nodejs into website: --  
        
            https://nodejs.org/en/download

    2 : 
        install packages (run into cloned project directory): -- 

            npm i
    
    3 : 
        declare alias in global variables (MACOS ~/zshrc): --

            alias flutter_feature="node *directory cloned project*/features_generator_riverpod/index.js" 

...


    Commands : 

        Create completed feature : 
            flutter_feature generate --feature_name=*
        
        Create presentation : 
            flutter_feature generate presentation --feature_name=* --presentation_name=*


HOW TO: 😇

    Write features into custom directory ? : 

        Commands: 

            Create completed feature : 
                flutter_feature generate --feature_name=* --dir=*
        
            Create presentation : 
                flutter_feature generate presentation --feature_name=* --presentation_name=* --dir=*

        Examples:   

                Commands: 

                    Create completed feature : 
                        flutter_feature generate --feature_name=warnings --dir=lib/src/features
        
                    Create presentation : 
                        flutter_feature generate presentation --feature_name=warnings --presentation_name=add_warning_button --dir=lib/src/features

