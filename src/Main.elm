port module Main exposing (main)

import Browser
import Html exposing (..)
import Html.Attributes as Attr
import Html.Events exposing (onClick)
import Json.Decode as D
import Json.Encode as E
import Subreddit


port stateChanged : (E.Value -> msg) -> Sub msg


port machineEvent : E.Value -> Cmd msg


main : Program () State Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


type State
    = Idle { subredditOptions : List String }
    | SubredditSelected
        { subredditOptions : List String
        , subreddit : Subreddit.State
        }


{-|

    {
        "value": "subredditSelected",
        "context": {
            "subreddit": {},
            "subredditOptions": ["elm", "react"]
        }
    }

-}
stateDecoder : D.Decoder State
stateDecoder =
    D.field "value" D.string
        |> D.andThen
            (\value ->
                case value of
                    "idle" ->
                        D.at [ "context", "subredditOptions" ] (D.list D.string) |> D.andThen (\options -> D.succeed (Idle { subredditOptions = options }))

                    "subredditSelected" ->
                        D.map2 (\options subreddit -> { subredditOptions = options, subreddit = subreddit })
                            (D.at [ "context", "subredditOptions" ] (D.list D.string))
                            (D.at [ "context", "subredditMachine", "state" ] Subreddit.stateDecoder)
                            |> D.andThen (SubredditSelected >> D.succeed)

                    v ->
                        D.fail ("Unknown state: " ++ v)
            )


type Msg
    = StateChanged State
    | DecodeStateError D.Error
    | SubredditClicked String


init : () -> ( State, Cmd Msg )
init _ =
    ( Idle { subredditOptions = [] }
    , Cmd.none
    )


update : Msg -> State -> ( State, Cmd Msg )
update msg state =
    case msg of
        StateChanged s ->
            ( s, Cmd.none )

        DecodeStateError _ ->
            ( state, Cmd.none )

        SubredditClicked subreddit ->
            ( state
            , machineEvent
                (E.object
                    [ ( "type", E.string "SELECT" )
                    , ( "subreddit", E.string subreddit )
                    ]
                )
            )


view : State -> Html Msg
view state =
    div [ Attr.id "main__view" ]
        (case state of
            Idle { subredditOptions } ->
                [ viewSubredditOptions subredditOptions
                ]

            SubredditSelected { subredditOptions, subreddit } ->
                [ viewSubredditOptions subredditOptions
                , Subreddit.view subreddit
                ]
        )


viewSubredditOptions : List String -> Html Msg
viewSubredditOptions options =
    ul []
        (List.map
            (\option ->
                li [] [ button [ onClick (SubredditClicked option) ] [ text option ] ]
            )
            options
        )


subscriptions : State -> Sub Msg
subscriptions _ =
    stateChanged
        (\value ->
            case D.decodeValue stateDecoder value of
                Ok s ->
                    StateChanged s

                Err e ->
                    DecodeStateError e
        )
