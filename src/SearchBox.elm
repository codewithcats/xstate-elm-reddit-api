module SearchBox exposing (..)

import Html exposing (..)
import Html.Attributes as Attr
import Html.Events exposing (onInput)
import Json.Decode as D
import Json.Encode as E
import MachineConnector


type State
    = Idle String
    | Ready String
    | Searching String


initialState : State
initialState =
    Idle ""


{-|

    {
        "value": "ready",
        "context": {
            "searchTerm": "term"
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
                        searchTermDecoder |> D.andThen (Idle >> D.succeed)

                    "ready" ->
                        searchTermDecoder |> D.andThen (Ready >> D.succeed)

                    "searching" ->
                        searchTermDecoder |> D.andThen (Searching >> D.succeed)

                    v ->
                        D.fail ("Unknown state: " ++ v)
            )


searchTermDecoder : D.Decoder String
searchTermDecoder =
    D.at [ "context", "searchTerm" ] D.string


type Msg
    = TextChanged String


update : Msg -> State -> ( State, Cmd Msg )
update msg state =
    case msg of
        TextChanged t ->
            ( state
            , MachineConnector.event
                (E.object
                    [ ( "type", E.string "SEARCH_BOX.SEARCH_TERM_CHANGED" )
                    , ( "searchTerm", E.string t )
                    ]
                )
            )


view : State -> Html Msg
view state =
    case state of
        Idle searchTerm ->
            div []
                [ input
                    [ Attr.type_ "text"
                    , onInput TextChanged
                    , Attr.value searchTerm
                    ]
                    []
                ]

        _ ->
            div [] []
